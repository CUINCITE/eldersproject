<?php

class model_app_pages_modules_collection extends model_app_pages_modules
{
    private mixed $settings;
    private mixed $parent;

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function updateModel($m, $url)
    {
        //exit($url[1].'!');
        $m['item'] = $this->parent->getJsonModel('interviewers', ['active' => 1, 'slug' => $url[1]], true);

        // display higher res cover
        $m['item']['image'] = $this->copyValues($m['item']['image'], 'big', 'desktop');

        if (!$m['item']) {
            return null;
        }

        $m['items'] = $this->parent->getJsonModel('interviews', ['interviewers' => $m['item']['id'], 'active' => 1], false, 'label');

        foreach ($m['items'] as $k=>$v) {
            foreach ($v['interviewers'] as $k2=>$v2) {
                if ($v2['id'] != $m['item']['id']) {
                    unset($m['items'][$k]);
                    break;
                }
            }
        }

        $m['modules'] = $this->parent->getJsonModel('collection_modules', ['parent' => $m['item']['id'], 'active' => 1]);

        $counter = 0;
        foreach ($m['modules'] as $k => $v) {

            if ($v['type']['slug'] == 'collection_chapter') {

                if ($counter % 2 != 0) {
                    $m['modules'][$k]['reversed'] = true;
                }

                $counter++;
                $m['modules'][$k]['article'] = $this->updateArticle($v['text'], $v['media']);

            }
        }

        return $m;
    }

    public function updateArticle($article, $article_media)
    {

        $findReplace = [
            '/<p><q class="quote">/' => '<blockquote class="quote"><p>',
            '/<\/q>\[AUDIO=([\d]+), ([\d:]+)-([\d:]+)\]<\/p>/' => '[AUDIO=$1, $2-$3]</p></blockquote>',
            '/<\/q><\/p>/' => '</p></blockquote>',
        ];
        $article = preg_replace(array_keys($findReplace), $findReplace, $article);

        $article = $this->processLoadMore($article);

        $dom = new DOMDocument();
        $dom->loadHTML("<body>{$article}</body>");

        $elements = [];
        $lastType = '';
        $bodyNode = $dom->getElementsByTagName('body')->item(0);

        foreach ($bodyNode->childNodes as $node) {

            $content = $dom->saveHTML($node);

            // change audio tags to buttons
            $content = $this->processAudioTag($content);

            // images
            if (str_contains($content, '<p><img src="/serdelia/public/ckeditor/plugins/uho_media/icons/uho_media.png"></p>') && !empty($article_media)) {
                $media_item = array_shift($article_media);
                $type = ($media_item['variant'] == 'photograph') ? 'image' : 'illustration';
                $elements[] = ['type' => $type, 'content' => $media_item];
            }

            // text blocks, including blockquotes
            else {

                $content = str_replace(
                    ['<blockquote>', '<q class="quote">', '</q>'],
                    ['<blockquote class="quote quote--big">', '<blockquote class="quote">', '</blockquote>'],
                    $content
                );

                $type = 'text';

                if ($lastType == $type && !empty($elements)) {
                    end($elements);
                    $elements[key($elements)]['content'] .= $content;
                } else {
                    $elements[] = ['type' => $type, 'content' => $content];
                }
            }

            $lastType = $type;

        }

        return $elements;
    }

    private function processAudioTag($content): string
    {
        // Check for audio tag and replace it with button
        $pattern = '/\[AUDIO=(\d+), ([0-9:]+)-([0-9:]+)\]/';
        if (preg_match($pattern, $content, $matches)) {
            $id = intval($matches[1]);
            $startHMS = $matches[2];
            list($h, $m, $s) = explode(':', $startHMS);
            $startSeconds = $s + ($m * 60) + ($h * 60 * 60);
            $button = '<button data-audio-player="' . $id . '" data-start="' . $startSeconds . '" class="quote__cassette">[[svg::cassette]]</button>';
            $content = preg_replace($pattern, $button, $content);
        }
        return $content;
    }

    private function processLoadMore($content)
    {
        $pattern = '/<p>\[MORE\]<\/p>(.*?)<p>\[ENDMORE\]<\/p>/s';

        preg_match_all($pattern, $content, $matches);

        $content = preg_replace_callback($pattern, function ($matches) {
            $uniqueId = uniqid('expand-quote-');
            $replacement = "<div class='text__expand expand' data-expand='' id='$uniqueId'>{$matches[1]}</div>
        <button class='text__expand-trigger button button--small' aria-expanded='false' aria-controls='$uniqueId'
                    data-expanded-text='Read less' data-hidden-text='Read more'><i
                        class='icon-btn-arrow arrow'><span></span><span></span><span class='triangle'></span></i><span
                        class='js-expand-text'>Read more</span></button>";

            return $replacement;
        }, $content);

        return $content;

    }

}

?>