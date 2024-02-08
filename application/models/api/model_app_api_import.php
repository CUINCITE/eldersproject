<?php

/**
 *
 *
 * 1. http://elder.lh/api/import?action=interviews
 * 2. cms interviews auto-update
 * 3. http://elder.lh/api/import?action=sessions
 * 4. http://elder.lh/api/import?action=media
 *
 *
 * SELECT  incite_id, COUNT(incite_id) FROM interviews GROUP BY incite_id HAVING COUNT(incite_id) > 1;
 * SELECT  incite_id, COUNT(incite_id) FROM sessions GROUP BY incite_id HAVING COUNT(incite_id) > 1;
 * UPDATE sessions,interviews SET sessions.label=CONCAT(interviews.label,' (',interviews.interviewer_name,')'),sessions.label_sort=CONCAT(interviews.label_sort,' (',interviews.interviewer_name,')') WHERE sessions.parent=interviews.id
 */

require_once('vendor/autoload.php');
use Maestroerror\HeicToJpg;

class model_app_api_import
{


    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $params)
    {
//        phpinfo();
//        die();
        //$action='interviews';
        //$action='narrators';
        //$action='sessions';
        //$action='states_allocate';
        $this->parent->cache_kill();
        $action = @_uho_fx::getGet('action');
        if (!$action) return ['result' => false, 'message' => 'No Action defined'];

        switch ($action) {

            case  "locations":
                $i = 0;
                $items = $this->parent->query('SELECT id,locations FROM interviews WHERE locations!=""');
                foreach ($items as $k => $v) {
                    $id = $v['id'];
                    $v = explode(';', trim($v['locations']));
                    $v[0] = trim($v[0]);
                    if ($v[0] && empty($v[1])) $v = ['narrator_location' => $v[0], 'interviewer_location' => $v[0]];
                    elseif ($v[0]) $v = ['narrator_location' => $v[0], 'interviewer_location' => trim($v[1])];
                    else $v = [];
                    if ($v) {
                        $i++;
                        $this->parent->putJsonModel('interviews', $v, ['id' => $id]);
                    }
                }
                return ['result' => true, 'message' => 'Updated interviews: ' . $i];

                break;

            case  "leads":
                $i = 0;
                $items = $this->parent->query('SELECT id,summary FROM interviews WHERE summary!=""');

                foreach ($items as $k => $v) {
                    $id = $v['id'];
                    $v = explode(';', trim($v['summary']));
                    $v[0] = trim($v[0]);
                    if ($v[0]) {
                        $i++;
                        $v = ['lead' => $v[0] . '.'];
                        $this->parent->putJsonModel('interviews', $v, ['id' => $id]);
                    }
                }
                return ['result' => true, 'message' => 'Updated interviews: ' . $i];

                break;
            /*
        case "states_allocate":
            $states = $this->parent->getJsonModel('s_states');
            $sessions = $this->parent->query('SELECT id,narrator_location FROM sessions WHERE narrator_location!=""');
            foreach ($sessions as $k => $v) {
                $vv = explode(',', $v['narrator_location']);
                $state = trim(array_pop($vv));
                if ($state && strlen($state) == 2) {
                    $i = _uho_fx::array_filter($states, 'slug', $state, ['first' => true]);
                    if ($i) {
                        $r = $this->parent->putJsonModel('sessions', ['narrator_state' => $i['id']], ['id' => $v['id']]);
                        if (!$r) exit('error');
                    } else echo ('not found=' . $vv[1] . ' ');
                }
            }
            exit('!');

            break;*//*
            case "states_add":
                $s = [];
                $ss = [];
                $states = $this->parent->query('SELECT id,narrator_location FROM sessions WHERE narrator_location!=""');
                foreach ($states as $k => $v) {
                    $v = explode(';', $v['narrator_location']);
                    foreach ($v as $kk => $vv) {
                        $vv = trim($vv);
                        if ($vv) {
                            $ss[$vv] = 1;
                            $vv = explode(',', $vv);
                        }
                        $vv = @trim($vv[1]);
                        if (strlen($vv) == 2) $s[$vv] = 1;
                    }
                }

                $this->parent->queryOut('TRUNCATE TABLE s_states');
                foreach ($s as $k => $v)
                    $this->parent->postJsonModel('s_states', ['slug' => $k, 'active' => 1]);
                break;
                */
            /*
        case "narrators":

            $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/csv/ElderProject_Interview_Data_20231127.csv', ';');
            $n = [];

            foreach ($items as $k => $v) {
                if (@$v['1st Narrator: Full Name']) $n[$v['1st Narrator: Full Name']] = $v['Brief Narrator Bio'];
                if (@$v['2nd Narrator: Full Name']) $n[$v['2nd Narrator: Full Name']] = $v['Brief Narrator Bio'];
                if (@$v['3rd Narrator: Full Name']) $n[$v['3rd Narrator: Full Name']] = $v['Brief Narrator Bio'];
            }

            $this->parent->queryOut('TRUNCATE TABLE narrators');

            foreach ($n as $k => $v) {
                $vv = explode(' ', $k);
                $last_name = array_pop($vv);
                $first_name = implode(' ', $vv);
                $this->parent->postJsonModel('narrators', ['active' => 1, 'name' => $first_name, 'surname' => $last_name, 'bio' => $v]);
            }

            return ['count' => count($n)];


            break;*/

            case "interviews":

                $narrators = $this->parent->getJsonModel('narrators');
                foreach ($narrators as $k => $v) $narrators[$k] = ['id' => $v['id'], 'name' => $v['name'] . ' ' . $v['surname']];
                $interviewers = $this->parent->getJsonModel('interviewers');
                foreach ($interviewers as $k => $v) $interviewers[$k] = ['id' => $v['id'], 'name' => $v['first_name'] . ' ' . $v['last_name']];

                $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/interviews.csv', ',');
                if (!$items) return ['message' => 'CSV not found'];

                $known_columns = [
                    'Interview ID',                 // --> incite_id
                    'Account: Account Name',        // skip
                    'Interview Name',               // skip
                    'Brief Narrator Bio',           // --> narrator.bio
                    'Bio summary (Byline)',                  // --> narrator.occupation
                    'Brief Interview Summary',      // --> summary
                    'Language of Interview',        // --> languages
                    'Session Count',                //skip
                    '1st Narrator: Full Name',      // --> narrators
                    '2nd Narrator: Full Name',      // --> narrators
                    '3rd Narrator: Full Name',      // --> narrators
                    'Interviewer: Full Name',       // --> interviewers
                    '2nd Interviewer: Full Name',   // --> interviewers
                    '3rd Interviewer: Full Name',    // --> interviewers
                    'Filter Topics',                // skip
                    'Topic(s)'                      // ---> topics
                ];

                foreach ($items[0] as $k => $v)
                    if (!in_array($k, $known_columns)) return ['result' => false, 'message' => 'Unknown column: ' . $k];

                $messages = [];
                $n_added = 0;
                $n_updated = 0;

                $dict_topics = $this->parent->getJsonModel('topics');


                foreach ($items as $k => $v) {

                    $topics = explode(';', str_replace('; ', ';', $v['Topic(s)']));

                    foreach ($topics as $kk => $vv) {
                        $vv = trim($vv);
                        if ($vv) {
                            $vv = _uho_fx::array_filter($dict_topics, 'label', $vv, ['first' => true]);
                            if (!$vv) return ['result' => false, 'message' => 'Topic not found: ' . $vv];
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
                                }
                                else exit('interviewer not found=' . $vv);
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

                break;
            /*
        case "sessions_old":

            $interviews = $this->parent->getJsonModel('interviews');
            foreach ($interviews as $k => $v)
                $interviews[$k] = ['id' => $v['id'], 'name' => $v['narrators'][0]['name'] . ' ' . $v['narrators'][0]['surname']];

            $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/ElderProject_Session_Data_20231113.csv', ';');
            foreach ($items as $k => $v) {

                $date = explode('/', $v['Session Date']);
                if (count($date) == 3) $date = $date[2] . '-' . _uho_fx::dozeruj($date[0], 2) . '-' . _uho_fx::dozeruj($date[1], 2);
                else $date = '';
                $languages = $v['Language of Interview'];
                $languages = str_replace(';', ',', $languages);
                $languages = str_replace(' and ', ', ', $languages);

                if (!$languages || $languages == 'English') $languages = [1];
                elseif ($languages == 'Spanish') $languages = [2];
                elseif ($languages == 'English, Spanish') $languages = [1, 2];
                else exit($languages . '!');

                $duration = trim($v['Media File Duration']);
                if ($duration) $duration = explode(':', $duration);
                if ($duration && count($duration) == 3) {
                    $duration = $duration[0] * 60 * 60 + $duration[1] * 60 + $duration[2];
                } elseif ($duration && count($duration) == 2) {
                    $duration = $duration[0] * 60 + $duration[1];
                } elseif ($duration) {
                    print_r($duration);
                    exit();
                }

                $interview = $v['1st Narrator: Full Name'];
                $interview_id = _uho_fx::array_filter($interviews, 'name', $interview, ['first' => true]);
                if (!$interview_id) exit('interview not found=' . $interview);
                else $interview_id = $interview_id['id'];

                $items[$k] = [
                    'nr' => intval(substr($v['Session Name'], 8)),
                    'parent' => $interview_id,
                    'acitve' => 1,
                    'media' => 'audio',
                    'date' => $date,
                    'narrator_location' => $v['Session Location(s)'],
                    'interviewer_location' => $v['Session Location(s)'],
                    'languages' => $languages,
                    'duration' => $duration,
                    'filename' => $v['Media File Name(s)']
                ];
            }

            /*$this->parent->queryOut('TRUNCATE TABLE sessions');
                foreach ($items as $k=>$v)
                {
                    $r=$this->parent->postJsonModel('sessions',$v);
                    if (!$r) exit($this->parent->orm->getLastError());
                }

            break;
*/
            case "sessions":

                $interviews = $this->parent->getJsonModel('interviews', [], false, null, null, ['fields' => ['incite_id', 'id']]);
                $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/ElderProject_Session_Data_20231211.csv', ',');
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

                    $interview_id = _uho_fx::array_filter($interviews, 'incite_id', $v['Interview ID'], ['first' => true]);

                    if (!$interview_id) {
                        return ['result' => false, 'message' => 'Sessions Interview not found=[' . $v['Interview ID'] . ']'];
                    }
                    $interview_id = $interview_id['id'];

                    $items[$k] = [
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
                foreach ($items as $k => $v) {
                    $r = $this->parent->putJsonModel(
                        'sessions',
                        $items[$k],
                        [
                            'incite_id' => $items[$k]['incite_id']
                        ]
                    );

                    if (!$r) return ['result' => false, 'message' => 'Error: ' . $this->parent->orm->getLastError()];
                }


                return ['result' => true, 'message' => 'Sessions all:' . count($items) . ', upated: ' . $i];

                break;

            /*
            MEDIA
            */

            case "media":

                // get files
                $dir = $_SERVER['DOCUMENT_ROOT'] . '/_data/_files';
                $files = [];
                $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
                foreach ($iterator as $file) {
                    if ($file->isDir()) continue;
                    $path = $files[] = $file->getPathname();
                }

                //get sessions
                $copy = [];
                $items = $this->parent->getJsonModel('sessions', [], false, null, null, ['fields' => ['id', 'uid', 'filename_mp3', 'filename_docx', 'audio', 'doc']]);
                foreach ($items as $k => $v) {
                    if (!$v['uid']) {
                        $v['uid'] = uniqid();
                        $this->parent->putJsonModel('sessions', ['uid' => $v['uid']], ['id' => $v['id']]);
                    }
                    if ($v['filename_mp3']) {
                        $copy[] = [
                            $v['filename_mp3'], '/public/upload/sessions/audio/' . $v['uid'] . '.mp3'
                        ];
                    }
                    if ($v['filename_docx']) {
                        $copy[] = [
                            $v['filename_docx'], '/public/upload/sessions/transcripts/' . $v['uid'] . '.docx'
                        ];
                    }
                }
                $c = 0;

                foreach ($copy as $k => $v) {
                    $found = false;
                    foreach ($files as $kk => $vv)
                        if (strpos($vv, $v[0])) {
                            $found = true;
                            $from = $vv;
                            $to = $_SERVER['DOCUMENT_ROOT'] . $v[1];
                            $s1 = @filesize($from);
                            if (!$s1) return ['result' => false, 'message' => 'file not found ' . $from];
                            $s2 = @filesize($to);
                            if ($s1 != $s2) {
                                @unlink($to);
                                $r = @copy($from, $to);
                                if (!$r) return ['result' => false, 'message' => 'Copy failed copied: ' . $from . ' -> ' . $to];
                                $c++;
                            }
                        }
                }
                return ['result' => true, 'message' => 'Files copied: ' . $c];

                break;


            case "mementos":
                $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/mementos.csv', ',');

                $items_count = 0;
                foreach ($items as $k => $v) {
                    $id = $v['Interview ID'];
                    $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);

                    if (!$interview) return ['message' => 'Interview not found: ' . $id];

                    // remove old items
                    if (!empty($interview['media'])) {
                        foreach ($interview['media'] as $k2 => $media_item) {

                            if (!empty($media_item['id']) && is_numeric($media_item['id'])) {
                                $this->parent->deleteJsonModel('media', ['id' => $media_item['id']]);
                            }

                            else {
                                return ['message' => 'Cannot remove media item: ' . $media_item['id']];
                            }


                            foreach ($media_item['image'] as $k3 => $image_size) {
                                $file = $_SERVER['DOCUMENT_ROOT'] . $image_size;
                                $file = parse_url($file, PHP_URL_PATH);
                                if (is_file($file)) {
                                    unlink($file);
                                }
                            }
                        }
                    }

                }

                foreach ($items as $k=> $v) {
                    $id = $v['Interview ID'];
                    $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);
                    // add new items
                    $uid = uniqid();

                    $item = [
                        'type' => 'image',
                        'caption' => $v['Description'],
                        'alt' => $v['Alt text'],
                        'uid' => $uid,
                        'model_id' => $interview['id'],
                        'model' => 'interviews',
                        'filename_original' => $v['Filename']
                    ];

                    $postSuccess = $this->parent->postJsonModel('media', $item);
                    if (!$postSuccess) return ['message' => 'Media Item not succesfully posted: ' . $id];
                    $items_count++;

                    $oldFile = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/'.$v['Filename'];
                    $ext = pathinfo($oldFile, PATHINFO_EXTENSION);

                    $newFile = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $uid . '.' . strtolower($ext);


                    if (!copy($oldFile, $newFile)) {
                        return ['message' => 'Resize image not successful: ' . $v['Filename']];
                    }

                    if (strtolower($ext) !== "jpg" && file_exists($newFile)) {

                        if (strtolower($ext) === "heic") {
                            try {
                                HeicToJpg::convertOnMac($newFile)->saveAs($_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $uid . '.jpg');
                                unlink($newFile);
                            } catch(Exception $e) {
                                return ['message' => 'Image conversion to jpg using HeicToJpg not successful: ' . $v['Filename'] . '. Error: ' . $e->getMessage()];
                            }
                        } else {
                            $imagick = new Imagick($newFile);
                            $jpgFile = pathinfo($newFile, PATHINFO_DIRNAME) . '/' . pathinfo($newFile, PATHINFO_FILENAME) . '.jpg';

                            try {
                                $imagick->setImageFormat('jpg');
                                $imagick->writeImage($jpgFile);
                            } catch(Exception $e) {
                                return ['message' => 'Image conversion to jpg using Imagick not successful: ' . $v['Filename']];
                            }
                        }

                    }


                }

                return ['message' => 'Import sucessful', 'items' => $items_count];

        }

        // --------------------------------------------------------------------------------

    }

}
