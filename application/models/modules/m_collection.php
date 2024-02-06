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

        // display higher res cover
        $m['item']['image'] = $this->copyValues($m['item']['image'], 'big', 'desktop');

        if (!$m['item']) {
            return null;
        }

        // get interviews
        $m['items'] = $this->parent->getJsonModel('interviews', ['interviewers' => $m['item']['id'], 'active' => 1], false, 'label');

//        temporary workaround - ORM error
        foreach ($m['items'] as $k=>$v) {
            foreach ($v['interviewers'] as $k2=>$v2) {
                if ($v2['id'] != $m['item']['id']) {
                    unset($m['items'][$k]);
                    break;
                }
            }
        }


        // get storytelling modules
        $m['modules'] = $this->parent->getJsonModel('collection_modules', ['parent' => $m['item']['id'], 'active' => 1]);
print_r($m['modules']);
        $counter = 0;
        foreach ($m['modules'] as $k => $v) {

            if ($v['type']['slug'] == 'collection_chapter') {

                $m['modules'][$k]['reversed'] = $counter % 2 != 0;
                $counter++;

                $m['modules'][$k]['article'] = $this->updateArticle($v['text'], $v['media']);

            }
        }

        return $m;
    }

    public function updateArticle($article, $article_media)
    {

        $article = $this->processAudioTag($article);

        $article = str_replace(
            ['<blockquote>', '<q>'],
            ['<blockquote class="quote quote--big">', '<q class="quote">'],
            $article
        );

        return $this->articleUpdate($article, $article_media);
    }

    private function processAudioTag($content): string
    {
        $pattern = '/\[AUDIO=(\d+), ([0-9:]+)-([0-9:]+)\]/';
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            $content = preg_replace_callback($pattern, function($matches) {
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

}

?>