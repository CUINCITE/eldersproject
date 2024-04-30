<?php

class model_app_api_interview
{

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $params, $url)
    {
        if (empty($params['slug']) && empty($url[2])) return null;

        $slug = (!empty($params['slug'])) ? $params['slug'] : $url[2];
        $item = $this->parent->getJsonModel('interviews', ['active' => 1, 'slug' => $slug], true);

        if (!$item) {
            return false;
        }

        $sessions = $this->parent->getJsonModel('sessions', ['active' => 1, 'parent' => $item['id']], false, 'nr');

        if (!$sessions) {
            return null;
        }

        $date1 = $sessions[0]['date'];
        $date2 = $sessions[count($sessions) - 1]['date'];
        if ($date1 == $date2) $item['date'] = _uho_fx::convertSingleDate($date1, 'en')['long_short_month'];
        else $item['date'] = _uho_fx::getDate($date1, $date2, 'en')['long_no_time'];

        return $this->getInterviewData($item, $sessions);
    }

    private function getInterviewData($item, $sessions)
    {
        
        //collection image
        $collectionImage = !empty($item['interviewers'][0]['image']) ? $item['interviewers'][0]['image'] : [];

        //mementos
        $media = [];
        if (!empty($item['media'])) {
            foreach ($item['media'] as $k=>$media_item) {
                if (!empty($media_item['image'])) {
                    $new_media['image'] = $media_item['image'];
                    $new_media['description'] = $media_item['caption'];
                    $media[] = $new_media;
                }
            }
        }

        // tags
        $tags = [];
        if (!empty($item['topics'])) {
            $i = 0;
            foreach ($item['topics'] as $k => $v) {
                if ($i == 4) {
                    break;
                }
                $tags[] = ['label'=>$v['label'],'url'=>['type'=>'interviews','topics'=>[$v['slug']]]];
                $i++;
            }
        }

        // transcripts
        $raw_transcripts = [];
        foreach ($sessions as $k=>$session) {
            $raw_transcripts[] = $session['transcript_tags'];
        }

        $transcript = [
            'english' => $this->formatMultipleTranscripts($raw_transcripts, $item['narrators'], $item['interviewers'],$sessions),
//            'spanish' => $this->formatTranscript($sessions)
        ];

        // bios
        // error
        // $interview_info = array_map(static fn($narrator) => "<p>{$narrator['bio']}</p>", $item['narrators']);

        $interview_info=[];
        foreach ($item['narrators'] as $k=>$v)
        if ($k==0 || '<p>'.$v['bio'].'</p>'!=$interview_info[0])
            $interview_info[]='<p>'.$v['bio'].'</p>';
        
        $label = (count($interview_info) > 1) ? 'Narrators bios' : $item['narrators'][0]['name'] . ' ' . $item['narrators'][0]['surname'] .' bio';

        $interview_info[] = "<h3>Interview Summary</h3><p>{$item['summary']}</p>";
        $interview_info = "<h3>{$label}</h3>" . implode('', $interview_info);

        //downloads
        $downloads = [];
        $langs=['en','es'];
        $langs2=['English','Spanish'];

        foreach ($langs as $k=>$lang)        
        if ($item['pdf_'.$lang.'_size'])
        {
            $downloads[] =
                [
                    "url" => 'api/download?transcript=' . $item['incite_id'].'&lang='.$lang,
                    "name" => $langs2[$k]." transcript",
                    "ext" => "pdf",
                    "filename" => _uho_fx::charsetNormalize($item['label']) . "-transcript-".$lang.".pdf",
                    "size" => $item['pdf_'.$lang.'_size'] ? number_format($item['pdf_'.$lang.'_size'] / 1000000, 2) . 'MB' : ''
                ];
        }
        foreach ($sessions as $k=>$v)
        $downloads[] =
                [
                    "url" => 'api/download?mp3=' . $v['incite_id'],
                    "name" => 'Audio file, Session #'.$v['nr'],
                    "ext" => "mp3",
                    "filename" => _uho_fx::charsetNormalize($item['label']) . "-".$v['nr']."audio.mp3",
                    "size" => @$v['mp3_size'] ? number_format(@$v['mp3_size'] / 1000000, 2) . 'MB' : ''
                ];

        // aggregate data
        $data = [
            'id' => $item['id'],
            'url' => ['type' => 'interview', 'slug' => $item['slug']],
            'urlBack' => ['type' => 'interviews'],
            'modifier' => !empty($item['interviewers'][0]['color']) ? $item['interviewers'][0]['color'] : '',
            'collectionImage' => $collectionImage,
            'images' => $media,
            'title' => $item['label'],
            'description' => $item['narrators'][0]['occupation'],
            'collection' => $item['interviewers'][0]['label'],
            'urlCollection' => ['type' => 'collection', 'slug' => $item['interviewers'][0]['slug']],
            'text' => $item['lead'],
            'tags' => $tags,
            'state' => $item['narrator_location'],
            'transcript' => $transcript,
            'info' => $interview_info,
            'downloads' => $downloads,
            'related' => $this->getRelated($item),
            'contentList' => $this->getTableOfContents($item, $sessions)
        ];

        return $data;
    }

    private function formatMultipleTranscripts($raw_transcripts, $narrators, $interviewers, $sessions): array
    {
        // Cumulative seconds of all previous transcripts
        $timeOffset = 0;
        $result = [];

        $narrator = (count($narrators) == 1) ? $narrators[0]['name'].' '.$narrators[0]['surname'] : 'Answer';
        $interviewer = (count($interviewers) == 1) ? $interviewers[0]['first_name'].' '.$interviewers[0]['last_name'] : 'Question';
        $session_nr=0;

        foreach ($raw_transcripts as $raw_transcript)
        {
            $lines = explode("\n", $raw_transcript);
            $max_transcript_seconds = 0;

            foreach ($lines as $line)
            {
                preg_match("/<([QA]) T=\"(\d\d:\d\d:\d\d)\">((?:[\w\s\-']*:)?)(.*)/", $line, $matches);

                if (isset($matches[1], $matches[2], $matches[4]))
                {
                    $time = explode(':', $matches[2]);
                    $transcript_seconds = count($time) == 3
                        ? intval($time[0]) * 3600 + intval($time[1]) * 60 + intval($time[2])
                        : intval($time[0]) * 60 + intval($time[1]);

                    // Detect the highest timestamp within the transcript
                    if ($transcript_seconds > $max_transcript_seconds) {
                        $max_transcript_seconds = $transcript_seconds;
                    }

                    // Add the timestamp of the previous transcript(s) to the current one
                    $total_seconds = $transcript_seconds + $timeOffset;

                    $name = $matches[3] ? trim($matches[3], " :") : ($matches[1] == 'Q' ? $interviewer : $narrator);
                    $text = "<strong>{$name}:</strong> " . $matches[4];
                    $result[] = [$total_seconds, $text];
                }
            }

            // WRONG! Update the time offset for the next transcript
            // $timeOffset += $max_transcript_seconds;
            $timeOffset+=$sessions[$session_nr]['duration'];
            $session_nr++;

        }

        return $result;
    }

    private function getRelated($interview)
    {
        $collectionId = $interview['interviewers'][0]['id'];
        $items =$this->parent->getJsonModel('interviews',['active'=>1, 'interviewers' => $collectionId],false,'RAND("'.date('Y-m-d').'")','0,3');

        $related = [];
            foreach ($items as $item) {

                if ($item['id'] === $interview['id']) {
                    continue;
                }

                $related[] = [
                    'id' => $item['id'],
                    'url' => ['type' => 'interview', 'slug' => $item['slug']],
                    'title' => $item['label'],
                    'collection' => $interview['interviewers'][0]['label'] . ' Collection',
                    'urlCollection' => ['type' => 'collection', 'slug' => $interview['interviewers'][0]['slug']],
                    'text' => $item['lead']
                ];
            }

        return array_slice($related, 0, 2);
    }

    private function getTableOfContents($item, $sessions): array
    {
        $indexes = $this->parent->getJsonModel('interview_indexes', ['interview_incite_id' => $item['incite_id']], false, 'no');

        // prepare simple table with sessions order for usort below
        $sessionsOrder = [];
        foreach ($sessions as $index => $session) {
            $sessionsOrder[$session['incite_id']] = $index;
        }

        // some interviews have multiple sessions - sort the $indexes table (table of contents) according to the sessions they are in
        usort($indexes, function ($a, $b) use ($sessionsOrder) {
            $sessionDiff = $sessionsOrder[$a['session_incite_id']] <=> $sessionsOrder[$b['session_incite_id']];
            if ($sessionDiff !== 0) {
                return $sessionDiff;
            }
        });

        $returnItems = [];
        foreach ($indexes as $index) {

            if (empty($index['label'])) {
                continue;
            }

            if (isset($sessionsOrder[$index['session_incite_id']])) {

                $sessionIndex = $sessionsOrder[$index['session_incite_id']];
                $startTime = $this->timeToSeconds($index['start_time']);
                
                if ($sessionIndex > 0) {
                    for ($i = 0; $i < $sessionIndex; $i++) {
                        $startTime += $sessions[$i]['duration'];
                    }
                }

                $returnItems[] = [
                    'label' => $index['label'],
                    'startTime' => $startTime,
                ];
            }
        }

        if (!empty($returnItems[0]) && $returnItems[0]['startTime'] != 0) {
            $introduction = [
                'label' => 'Introduction',
                'startTime' => 0
            ];

            array_unshift($returnItems, $introduction);
        }

        return $returnItems;
    }


    private function timeToSeconds($timestamp)
    {
        list($hours, $minutes, $seconds) = explode(':', $timestamp);
        $total_seconds = $hours*3600 + $minutes*60 + $seconds;

        return $total_seconds;
    }

}
