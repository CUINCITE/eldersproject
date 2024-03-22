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

        // if no mementos, display placeholder main image
        $mainImage = false;
        if (empty($media)) {

            // this is only temporary image assignment
            if (!empty($item['illustration']['image'])) $image = $item['illustration']['image'];
            else $image = $this->parent->getJsonModel('interview_illustrations', ['active' => 1], true, 'rand()')['image'];

            if (!$image) {
                $image = [
                    'desktop' => '/src/images/illu-1.png',
                    'mobile' => '/src/images/illu-1.png'
                ];
            }

            $mainImage = [
                'type' => '',
                'image' => $image
            ];
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
            'english' => $this->formatMultipleTranscripts($raw_transcripts, $item['narrators'], $item['interviewers']),
//            'spanish' => $this->formatTranscript($sessions)
        ];

        // bios
        $interview_info = array_map(static fn($narrator) => "<p>{$narrator['bio']}</p>", $item['narrators']);
        $label = (count($interview_info) > 1) ? 'Narrators bios' : $item['narrators'][0]['name'] . ' ' . $item['narrators'][0]['surname'] .' bio';

        $interview_info[] = "<h3>Interview Summary</h3><p>{$item['summary']}</p>";
        $interview_info = "<h3>{$label}</h3>" . implode('', $interview_info);

        //downloads
        $downloads = [];
        if (!empty($item['PDF']['src'])) {
            $downloads[] =
                [
                    "url" => 'api/download?transcript=' . $item['id'],
                    "name" => "Transcript",
                    "ext" => "pdf",
                    "filename" => _uho_fx::charsetNormalize($item['label']) . "-transcript.pdf",
                    "size" => $item['pdf_size'] ? number_format($item['pdf_size'] / 1000000, 1) . 'MB' : ''
                ];
        }

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
            'contentList' => $this->getContentList($item, $sessions)
        ];

        if ($mainImage) {
            unset($data['images']);
            $data['mainImage'] = $mainImage;
        }

        return $data;
    }

    private function formatMultipleTranscripts($raw_transcripts, $narrators, $interviewers): array
    {
        // Cumulative seconds of all previous transcripts
        $timeOffset = 0;
        $result = [];

        $narrator = (count($narrators) == 1) ? $narrators[0]['name'].' '.$narrators[0]['surname'] : 'Answer';
        $interviewer = (count($interviewers) == 1) ? $interviewers[0]['first_name'].' '.$interviewers[0]['last_name'] : 'Question';

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

            // Update the time offset for the next transcript
            $timeOffset += $max_transcript_seconds;
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

    private function getContentList($item, $sessions): array
    {
        $indexes = $this->parent->getJsonModel('interview_indexes', ['interview' => $item['id']], false, 'no');

        $sessionsOrder = [];
        foreach ($sessions as $index => $session) {
            $sessionsOrder[$session['id']] = $index;
        }

        usort($indexes, function ($a, $b) use ($sessionsOrder) {
            $sessionDiff = $sessionsOrder[$a['session']] <=> $sessionsOrder[$b['session']];
            if ($sessionDiff !== 0) {
                return $sessionDiff;
            }

        });


        $sessionMap = [];
        foreach ($sessions as $index => $session) {
            $sessionMap[$session['id']] = $index;
        }

        $returnItems = [];
        foreach ($indexes as $index) {

            if (empty($index['label'])) {
                continue;
            }

            if (isset($sessionMap[$index['session']])) {

                $sessionIndex = $sessionMap[$index['session']];
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
