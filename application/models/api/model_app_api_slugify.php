<?php

class model_app_api_slugify
{

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $params)
    {
        $interviews = $this->parent->getJsonModel('interviews', ['slug' => '']);
//        dd($interviews);
        $interviews_updated_count = 0;

        foreach ($interviews as $k=>$interview) {
            $slug = '';
            foreach ($interview['narrators'] as $k2=>$narartor) {
                $slug .= $narartor['name'] . ' ' . $narartor['surname'] . ' ';
                $slug = strtolower($slug);
                $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
                $slug = trim($slug, '-');
                $r = $this->parent->putJsonModel('interviews', ['slug' => $slug], ['id' => $interview['id']]);
                if (!$r) return ['result' => false, 'message' => 'Error updating interview: ' . $this->parent->orm->getLastError()];
            }
        }

        return ['result' => true, 'interviews updated' => $interviews_updated_count];
    }

    private function getInterviewData($item, $sessions)
    {
        //collection image
        $collectionImage = !empty($item['interviewers'][0]['image']) ? $item['interviewers'][0]['image'] : [];

        //mementos
        $media = [];
        if (!empty($item['media'])) {
            foreach ($item['media'] as $k=>$media_item) {
                if (!empty($media_item['image'])) $media[] = $media_item['image'];
            }
        }

        // if no mementos, display placeholder main image
        $mainImage = false;
        if (empty($media)) {
            $mainImage = [
                'type' => '',
                'image' => [
                    'desktop' => '/src/images/lightbox-fresh.png',
                    'mobile' => '/src/images/lightbox-fresh.png'
                ]
            ];
        }

        // tags
        $tags = [];
        if (!empty($item['topics'])) {
            foreach ($item['topics'] as $k => $v) {
                $tags[] = $v['label'];
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
                preg_match("/<([QA]) T=\"(\d\d:\d\d:\d\d)\">((?:[\w\s]*:)?)(.*)/", $line, $matches);

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

                    $name = $matches[3] ? trim($matches[3], " :") : ($matches[1] == 'Q' ? $narrator : $interviewer);
                    $text = "<strong>{$name}:</strong> " . $matches[4];
                    $result[] = [$total_seconds, $text];
                }
            }

            // Update the time offset for the next transcript
            $timeOffset += $max_transcript_seconds;
        }

        return $result;
    }

}
