<?php

class model_app_pages_modules_collection extends model_app_pages_modules
{
    public mixed $settings;
    public mixed $parent;

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

        $this->parent->ogSet($m['item']['label'], $m['item']['lead']);

        // display higher res cover
        $m['item']['image'] = $this->copyValues($m['item']['image'], 'big', 'desktop');

        // get interviews
        $m['items'] = $this->parent->getJsonModel('interviews', ['interviewers' => $m['item']['id'], 'active' => 1], false, 'label');

//        temporary workaround - ORM error
        foreach ($m['items'] as $k => $v) {
            foreach ($v['interviewers'] as $k2 => $v2) {
                if ($v2['id'] != $m['item']['id']) {
                    unset($m['items'][$k]);
                    break;
                }
            }
        }

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
                    $counter++;
                    $modules[$k]['article'] = $this->updateArticle($v['text'], $v['media']);
                    break;

                case 'quote_panel':
                    $modules[$k]['bio'] = $parentModule['item']['text'];
                    $modules[$k]['heading']['text'] = $parentModule['item']['label'];
                    break;
            }

        }

        return $modules;
    }

    public function updateArticle($article, $article_media)
    {

        $article = $this->processAudioTag($article);

        return $this->articleUpdate($article, $article_media);
    }

    private function processAudioTag($content): string
    {
        $pattern = '/\[AUDIO=(\d+), ([0-9:]+)-([0-9:]+)\]/';
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            $content = preg_replace_callback($pattern, function ($matches) {
                $id = intval($matches[1]);
                $startHMS = $matches[2];
                list($h, $m, $s) = explode(':', $startHMS);
                $startSeconds = $s + ($m * 60) + ($h * 60 * 60);
                $button = '<button data-audio-player="' . $id . '" data-start="' . $startSeconds . '" class="quote__cassette">[[svg::cassette]]</button>';
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
        $interviews = $this->parent->getJsonModel('interviews', ['active' => 1], false, null, null, ['fields' => ['label', 'slug']]);
        $items = $this->parent->getJsonModel('map_locations', ['active' => 1, 'collection' => $collection]);

        foreach ($items as $k => $v)
            if ($v['quotes'])
                foreach ($v['quotes'] as $kk => $vv) {
                    $i = _uho_fx::array_filter($interviews, 'label', $vv[0], ['first' => true]);
                    if ($i) $items[$k]['quotes'][$kk] =
                        [
                            'title' => $i['label'],
                            'duration' => $vv[1],
                            'start' => $this->time2seconds($vv[1]),
                            'id' => $i['id']
                        ];
                    else unset($items[$k]['quotes'][$kk]);

                }

        return $items;
    }

}

?>