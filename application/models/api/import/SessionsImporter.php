<?php

class SessionsImporter extends model_app_api_import
{
    private $index;

    // Constructor
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {

        $this->parent->queryOut('UPDATE interviews SET locations=""');

        $interviews = $this->parent->getJsonModel('interviews', [], false, null, null, ['fields' => ['incite_id', 'id']]);
        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/sessions.csv', ',');
        $i = 0;

        $known_columns = [
            'Interview ID',                 // --> parent.incite_id
            'Session Info ID',              // --> incite_id
            'Interviewer: Full Name',       // skip
            'Interview Name',               // skip
            'Session Name',                 // --> nr
            'Session Date',                 // --> date
            'Session Location(s)',         // --> narrator_location/interviewer_location
            'Timestamped transcript name',  // --> filename_docx
            'Web audio filename',           //  --> filename_mp3
            'Media File Name(s)',           // --> skip
            'Media File Duration'           // --> duration
        ];

        foreach ($items[0] as $k => $v)
            if (!in_array($k, $known_columns)) return ['result' => false, 'message' => 'Unknown column: ' . $k];

        $notFound = [];

        $newItems = [];

        foreach ($items as $k => $v) {
            $date = explode('/', $v['Session Date']);
            if (count($date) == 3) $date = $date[2] . '-' . _uho_fx::dozeruj($date[0], 2) . '-' . _uho_fx::dozeruj($date[1], 2);
            $duration = trim($v['Media File Duration']);
            if ($duration) $duration = explode(':', $duration);
            if ($duration && count($duration) == 3) {
                $duration = $duration[0] * 60 * 60 + $duration[1] * 60 + $duration[2];
            } elseif ($duration && count($duration) == 2) {
                $duration = $duration[0] * 60 + $duration[1];
            } elseif ($duration) {
                $duration = 0;
            }


            // update interview Locations
            $interview_id = array_search($v['Interview ID'], array_column($interviews, 'incite_id'));

            if ($interview_id === false) {

                $notFound[] = $v['Interview ID'];
                continue;

//                        return ['result' => false, 'message' => 'Sessions Interview not found=[' . $v['Interview ID'] . ']'];
            }

            $interview_id = $interviews[$interview_id];
            $interview_id = $interview_id['id'];

            // update locations
            $interview = $this->parent->getJsonModel('interviews', ['id' => $interview_id], true, null, null, ['fields' => ['locations']]);

            $locations = $v['Session Location(s)'];

            if ($interview['locations']) {
                $locations = explode(';', $interview['locations']);
                $locations[] = $v['Session Location(s)'];
                $locations = implode(';', $locations);
            }

            $updateLocations = $this->parent->putJsonModel(
                'interviews',
                ['locations' => $locations],
                [
                    'id' => $interview_id
                ]
            );

            if (!$updateLocations) return ['result' => false, 'message' => 'Error: ' . $this->parent->orm->getLastError()];

            $newItems[] = [
                'nr' => intval(substr($v['Session Name'], 8)),
                'incite_id' => $v['Session Info ID'],
                'parent' => $interview_id,
                'media' => 'audio',
                'date' => $date,
                'narrator_location' => $v['Session Location(s)'],
                'interviewer_location' => $v['Session Location(s)'],

                'filename_docx' => $v['Timestamped transcript name'],
                'filename_mp3' => $v['Web audio filename'],

                'duration' => $duration,
                'active' => 1
            ];


            $i++;
        }

        $this->parent->queryOut('UPDATE sessions SET active=0');
        foreach ($newItems as $k => $v) {
            $r = $this->parent->putJsonModel(
                'sessions',
                $v,
                [
                    'incite_id' => $v['incite_id']
                ]
            );

            if (!$r) return ['result' => false, 'message' => 'Error: ' . $this->parent->orm->getLastError()];
        }


        return ['result' => true, 'message' => 'Sessions all:' . count($items) . ', upated: ' . $i, 'interviewsNotFound' => $notFound];

    }
}
