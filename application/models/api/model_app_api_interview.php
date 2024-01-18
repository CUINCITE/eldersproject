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
        $slug = (!empty($params['slug'])) ? $params['slug'] : $url[2];

        $item = $this->parent->getJsonModel('interviews', ['active' => 1, 'slug' => $slug], true);

        if (!$item) $m = null; else {
            $sessions = $this->parent->getJsonModel('sessions', ['active' => 1, 'parent' => $item['id']], false, 'nr');
            $date1 = $sessions[0]['date'];
            $date2 = $sessions[count($sessions) - 1]['date'];
            if ($date1 == $date2) $item['date'] = _uho_fx::convertSingleDate($date1, 'en')['long_short_month'];
            else $item['date'] = _uho_fx::getDate($date1, $date2, 'en')['long_no_time'];
        }

        return $this->getInterviewData($item, $sessions);
    }

    private function getInterviewData($item, $sessions)
    {
        //collection image
        $collectionImage = !empty($item['interviewers'][0]['image']) ? $item['interviewers'][0]['image'] : [];

        //mementos
        if (!empty($item['media'])) {
            $media = [];
            foreach ($item['media'] as $k=>$media_item) {
                if (!empty($media_item['image'])) $media[] = $media_item['image'];
            }
        }

        if (empty($media)) $media[] = ['desktop' => '/src/images/lightbox-fresh.png'];

        // tags
        $tags = [];
        if (!empty($item['topics'])) {
            foreach ($item['topics'] as $k => $v) {
                $tags[] = $v['label'];
            }
        }


        $transcript = [
            'english' => $this->formatTranscript($sessions[0]['transcript_tags']),
            'spanish' => $this->formatTranscript($sessions[0]['transcript_tags'])
        ];

        // biograms
        $interview_info = array_map(static fn($narrator) => "<p>{$narrator['bio']}</p>", $item['narrators']);
        $label = (count($interview_info) > 1) ? 'Narrators bios' : 'Narrator bio';

        $interview_info[] = "<h3>Interview Summary</h3><p>{$item['summary']}</p>";
        $interview_info = "<h3>{$label}</h3>" . implode('', $interview_info);


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
            'text' => substr($item['summary'], 0, 240),
            'tags' => $tags,
            'state' => $item['narrator_location'],
            'transcript' => $transcript,
            'info' => $interview_info,
            'downloads' => [
                ['url' => '',
                    'name' => 'Transcript',
                    'ext' => 'PDF',
                    'filename' => ''
                ]
            ],
            'related' => [
                ['url' => '',
                    'title' => 'Related title',
                    'collection' => 'Collection title',
                    'test' => 'Lorem ipsum'
                ]
            ]
        ];

        return $data;
    }

    private function getInterviewDataa($item, $tags, $related)
    {
        $duration = 0;
        foreach ($item['sessions'] as $k => $v) {
            if (!$v['media']);
            elseif ($v['media'] == 'audio') $duration += $v['audio']['duration'];
            else $duration += $v['video']['duration'];
        }

        $narrator_location = [$item['sessions'][0]['narrator_location']];
        foreach ($item['sessions'] as $k => $v)
            if ($k > 0 && !in_array($v['narrator_location'], $narrator_location))
                $narrator_location[] = $v['narrator_location'];

        $info = [];
        if ($item['preface']) $info[] = "<h3>Interview description</h3>" . $item['preface'];
        if ($item['bio']) $info[] = '<h3>Narrator Bio</h3><p>' . $item['bio'] . '</p>';
        if ($item['citation']) $info[] = '<h3>Citation</h3><p>' . $item['citation'] . '</p>';

        $downloads = [];
        if (!empty($item['pdf']['src'])) {
            $downloads[] =
                [
                    "url" => 'api/download?transcript=' . $item['id'],
                    "name" => "Transcript",
                    "ext" => "PDF",
                    "filename" => _uho_fx::charsetNormalize($item['name']) . "-transcript.pdf",
                    "size" => $item['pdf_size'] ? number_format($item['pdf_size'] / 1000000, 1) . 'MB' : ''
                ];
        }

        $result =
            [
                'title' => 'Interview with ' . $item['name'] . ' - Obama Presidency Oral History',
                'id' => $item['id'],
                'url' => ['type' => 'interview', 'slug' => $item['slug']],
                'url_fav' => ['type' => 'interview_fav', 'id' => $item['id']],
                'url_back' => ['type' => 'interviews'],
                'sessions' => $item['sessions'],
                'totalDuration' => $duration,
                'thumbnail' => $item['image']['desktop'],
                'thumbnail_square' => $item['image']['square'],
                'narrator' =>
                    [
                        "id" => $item['id'],
                        "name" => [$item['name1'], $item['surname1']],
                        "profession" => $item['occupation'],
                        "url" => ""

                    ],
                'interviewers' => $this->getInterviewers($item['interviewer']),

                'tags' => $tags,
                'related' => $related,
                'date' => $item['date'],
                "summary" => $item['summary'],
                "info" => [
                    "date" => $item['date'],
                    "place" => implode(', ', $narrator_location),
                    "text" => implode('', $info)
                ],
                "downloads" => $downloads,
                "saved" => $this->parent->favGet('i' . $item['id'])
            ];
        return $result;
    }

    private function formatTranscript($raw_transcript)
    {
        $lines = explode("\n", $raw_transcript);
        $result = [];

        foreach ($lines as $line) {
            preg_match("/<([QA]) T=\"(\d\d:\d\d:\d\d)\">((?:[\w\s]*:)?)(.*)/", $line, $matches);
            if (isset($matches[1], $matches[2], $matches[4])) {
                $time = explode(':', $matches[2]);
                $total_seconds = count($time) == 3
                    ? intval($time[0]) * 3600 + intval($time[1]) * 60 + intval($time[2])
                    : intval($time[0]) * 60 + intval($time[1]);

                $name = $matches[3] ? trim($matches[3], " :") : ($matches[1] == 'Q' ? "Question" : "Answer");
                $text = "<strong>{$name}:</strong> " . $matches[4];
                $result[] = [$total_seconds, $text];
            }
        }

        return $result;
    }

    private function getInterviewers($items)
    {
        foreach ($items as $k => $v)
            $items[$k] =
                [
                    "id" => $v['id'],
                    "name" => $v['first_name'] . ' ' . $v['last_name'],
                    "url" => $v['active'] ? (!empty($v['people_index']['url']) ? $v['people_index']['url'] : $v['url']) : null
                ];

        return $items;
    }
}
