<?php

class InterviewsImporter extends model_app_api_import
{


    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {

        $narrators = $this->parent->getJsonModel('narrators');
        foreach ($narrators as $k => $v) {
            $narrators[$k] = ['id' => $v['id'], 'name' => $v['name'] . ' ' . $v['surname']];
        }


        $interviewers = $this->parent->getJsonModel('interviewers');
        foreach ($interviewers as $k => $v) {
            $interviewers[$k] = ['id' => $v['id'], 'name' => $v['first_name'] . ' ' . $v['last_name']];
        }

        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/interviews.csv', ',');
        if (!$items) return ['message' => 'CSV not found'];

        $known_columns = [
            'Interview ID',                 // --> incite_id
            'Account: Account Name',        // skip
            'Interview Name',               // skip
            'Brief Narrator Bio',           // --> narrator.bio
            'Bio summary (Byline)',                  // --> narrator.occupation
            'Brief Interview Summary',      // --> summary
            '230 Character Summary',        // ---> lead
            'Language of Interview',        // --> languages
            'Session Count',                //skip
            '1st Narrator: Full Name',      // --> narrators
            '2nd Narrator: Full Name',      // --> narrators
            '3rd Narrator: Full Name',      // --> narrators
            'Interviewer: Full Name',       // --> interviewers
            '2nd Interviewer: Full Name',   // --> interviewers
            '3rd Interviewer: Full Name',    // --> interviewers
            'Filter Topics',                // skip
            'Topic(s)',                      // ---> topics
            'Index available?' // skip
        ];

        foreach ($items[0] as $k => $v)
            if (!in_array($k, $known_columns)) return ['result' => false, 'message' => 'Unknown column: ' . $k];

        $messages = [];
        $n_added = 0;
        $n_updated = 0;

        $dict_topics = $this->parent->getJsonModel('topics');


        foreach ($items as $k => $v) {

            $topics = explode(',', str_replace('; ', ';', $v['Topic(s)']));

            foreach ($topics as $kk => $vv) {
                $vv = trim($vv);
                if ($vv) {
                    $vv = _uho_fx::array_filter($dict_topics, 'label', $vv, ['first' => true]);
                    if (!$vv) {
                        return ['result' => false, 'message' => 'Topic not found: ' . $vv];
                    }
                    $topics[$kk] = $vv['id'];
                } else unset($topics[$kk]);
            }
            if (!$topics) $topics = [];
            else $topics = array_values($topics);


            $n = [];
            if (@$v['1st Narrator: Full Name']) $n[] = $v['1st Narrator: Full Name'];
            if (@$v['2nd Narrator: Full Name']) $n[] = $v['2nd Narrator: Full Name'];
            if (@$v['3rd Narrator: Full Name']) $n[] = $v['3rd Narrator: Full Name'];
            $name = implode(', ', $n);


            // narrators
            foreach ($n as $kk => $vv) {
                $id = _uho_fx::array_filter($narrators, 'name', $vv, ['first' => true]);
                if (!$id) {
                    $messages[] = 'Narrator added: ' . $vv;
                    $name = explode(' ', $vv);
                    $surname = array_pop($name);
                    $name = implode(' ', $name);

                    $r = $this->parent->postJsonModel(
                        'narrators',
                        [
                            'name' => $name,
                            'surname' => $surname,
                            'uid' => uniqid(),
                            'bio' => $v['Brief Narrator Bio'],
                            'occupation' => $v['Bio summary (Byline)'],
                            'active' => 1
                        ]
                    );
                    if (!$r) return ['result' => false, 'message' => $this->parent->orm->getLastError()];
                    $n_added++;
                } else {
                    $r = $this->parent->putJsonModel(
                        'narrators',
                        [
                            'bio' => $v['Brief Narrator Bio'],
                            'occupation' => $v['Bio summary (Byline)']
                        ],
                        ['id' => $id['id']]
                    );
                    $n[$kk] = $id['id'];
                    $n_updated++;
                    if (!$r) return ['result' => false, 'message' => $this->parent->orm->getLastError()];
                }
            }

            $namesDictionary = [
                'Carolina De Robertis' => 'Caro De Robertis',
                'Eve Ewing' => 'Eve L. Ewing',
                'Jenna "J" Wortham' => 'Jenna Wortham'
            ];

            // ID=narrator id
            if (@$id) {
                $i = [];
                if (@$v['Interviewer: Full Name']) $i[] = $v['Interviewer: Full Name'];
                if (@$v['2nd Interviewer: Full Name']) $i[] = $v['2nd Interviewer: Full Name'];
                if (@$v['3rd Interviewer: Full Name']) $i[] = $v['3rd Interviewer: Full Name'];
                foreach ($i as $kk => $vv) {
                    $id = _uho_fx::array_filter($interviewers, 'name', $vv, ['first' => true]);
                    if (!$id) {
                        if (isset($namesDictionary[$vv])) {
                            $vv = $namesDictionary[$vv];
                            $id = _uho_fx::array_filter($interviewers, 'name', $vv, ['first' => true]);
                            if (!$id) exit('interviewer not found=' . $vv);
                        } else exit('interviewer not found=' . $vv);
                    }
                    $i[$kk] = $id['id'];
                }

                $languages = $v['Language of Interview'];
                $languages = str_replace(';', ',', $languages);
                $languages = str_replace(' and ', ', ', $languages);

                if (!$languages || $languages == 'English') $languages = [1];
                elseif ($languages == 'Spanish') $languages = [2];
                elseif ($languages == 'English, Spanish') $languages = [1, 2];
                else return ['result' => false, 'message' => 'Unknown languages: ' . $languages];

                $items[$k] = [
                    'incite_id' => $v['Interview ID'],
                    'narrators' => $n,
                    'lead' => $v['230 Character Summary'],
                    'label' => $name,
                    'languages' => $languages,
                    'interviewers' => $i,
                    'summary' => $v['Brief Interview Summary'],
                    'topics' => $topics,
                    'active' => 1
                ];
            } else unset($items[$k]);
        }

        $this->parent->queryOut('UPDATE interviews SET active=0');
        foreach ($items as $k => $v) {
            $r = $this->parent->putJsonModel('interviews', $v, ['incite_id' => $v['incite_id']]);
            if (!$r) return ['result' => false, 'message' => 'Error updating interview: ' . $this->parent->orm->getLastError()];
        }

        $message[] = 'Added narrators: ' . $n_added;
        $message[] = 'Updated narrators: ' . $n_updated;
        $message[] = 'Activated interviews: ' . count($items);
        return ['result' => true, 'message' => implode(' ... ', $message)];
    }
}