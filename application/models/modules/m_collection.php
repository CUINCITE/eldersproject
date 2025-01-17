<?php

class model_app_pages_modules_collection extends model_app_pages_modules
{
    var $parent,$settings;

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function updateModel($m, $url)
    {
        $m['item'] = $this->parent->getJsonModel('interviewers', ['active' => 1, 'slug' => $url[1]], true);

        if (!$m['item']) {
            $this->parent->set404();
            return null;
        }

        //og
        $image = $m['item']['image']['og']['src'] ?? $m['item']['image']['og'];
        $this->parent->ogSet($m['item']['label'] . ' ' . 'Collection', $m['item']['lead'], $image);

        // display higher res cover
        $m['item']['image'] = $this->copyValues($m['item']['image'], 'big', 'desktop');
        
        // get interviews
        $m['items'] = $this->parent->getJsonModel('interviews_list', ['interviewers' => $m['item']['id'], 'active' => 1], false, 'label');

        // get storytelling modules
        $m['modules'] = $this->parent->getJsonModel('collection_modules', ['parent' => $m['item']['id'], 'active' => 1]);
        $m['modules'] = $this->updateCollectionModules($m['modules'], $m);


        $m['map'] = $this->getMap($m['item']['id']);

        return $m;
    }

    private function updateCollectionModules($modules, $parentModule)
    {
        $counter = 0;
        foreach ($modules as $k => $v) {

            switch ($v['type']['slug']) {

                case 'collection_chapter':
                    $modules[$k]['reversed'] = $counter % 2 != 0;
                    $modules[$k]['color'] = $parentModule['item']['color'];
                    $modules[$k]['article'] = $this->updateArticle($v['text'], $v['media'], $v['playlist']);

                    $counter++;
                    break;

                case 'meet_interviewer':
                    $modules[$k]['bio'] = $parentModule['item']['text'];
                    $modules[$k]['heading']['text'] = $parentModule['item']['label'];
                    break;
            }

        }

        return $modules;
    }

    public function updateArticle($article, $article_media, $playlist)
    {

        $article = $this->processAudioTag($article);

        return $this->articleUpdate($article, $article_media, $playlist);
    }

    private function processAudioTag($content): string
    {
        $pattern = '/\[AUDIO=([0-9_]+), ([0-9:]+)-([0-9:]+)\]/';
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            $content = preg_replace_callback($pattern, function ($matches) {
                $audio = explode('_',$matches[1]);
                $id = intval($audio[0]);
                $session = isset($audio[1]) ? $audio[1] : 1;
                $startHMS = $matches[2];

                $timeParts = explode(':', $startHMS);

                if (count($timeParts) === 3) {
                    list($h, $m, $s) = $timeParts;

                    if (is_numeric($h) && is_numeric($m) && is_numeric($s)) {
                        $startSeconds = $s + ($m * 60) + ($h * 3600);
                        if ($session>1)
                        {
                            $sessions=$this->parent->getJsonModel('sessions',['parent'=>$id],false,'nr');
                            foreach ($sessions as $k=>$v)
                            if (($k+1)<$session)
                                $startSeconds+=$v['duration'];
                        }
                        $button = '<button data-audio-player="' . $id . '" data-start="' . $startSeconds . '" class="quote__cassette">[[svg::cassette]]</button>';
                    } else {
                        $button = '';
                    }
                } else {
                    $button = '';
                }
                return $button;

            }, $content);
        }
        return $content;
    }

    private function time2seconds($t)
    {
        $t = explode(':', $t);
        return $t[2] + $t[1] * 60 + $t[0] * 60 * 60;
    }

    private function getMap($collection)
    {
        $interviews = $this->parent->getJsonModel('interviews', ['active' => 1], false, null, null, ['fields' => ['label', 'slug', 'incite_id']]);
        $items = $this->parent->getJsonModel('map_locations', ['active' => 1, 'collection_hide'=>0,'collection' => $collection]);

        foreach ($items as $k => $v) {
            $quotes = [];

            if ($v['quotes'])
            {
                
                foreach ($v['quotes'] as $kk => $vv)
                {
                    $i = _uho_fx::array_filter($interviews, 'incite_id', $vv[2], ['first' => true,'strict'=>true]);
                
                    if ($i && $vv[1])
                    {
                        
                        $time = explode(':', $vv[1]);
                        $time = _uho_fx::dozeruj($time[0], 2) . ':' . _uho_fx::dozeruj($time[1], 2) . ':' . _uho_fx::dozeruj($time[2], 2);

                        $quotes[] = [
                            'title' => $i['label'],
                            'duration' => $time,
                            'start' => $this->time2seconds($time),
                            'id' => $i['id']
                        ];

                    }

                }
            }

            $items[$k]['quotes'] = $quotes;
        }

        return $items;
    }

}

?>