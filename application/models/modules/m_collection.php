<?php

class model_app_pages_modules_collection extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        //exit($url[1].'!');
        $m['item']=$this->parent->getJsonModel('interviewers',['active'=>1,'slug'=>$url[1]],true);
        if (!$m['item']) $m=null;
		else
		{
        	$m['items']=$this->parent->getJsonModel('interviews',['interviewers'=>$m['item']['id'],'active'=>1],false,'label');
            $m['modules'] =$this->parent->getJsonModel('collection_modules',['parent' => $m['item']['id'],'active'=>1]);

            foreach ($m['modules'] as $k=>$v) {
                if ($v['type']['slug'] == 'collection_chapter') {
                    $m['modules'][$k]['article'] = $this->updateArticle($v['text'], $v['media']);
                }
            }
		}
		
		return $m;
	}

    public function updateArticle($article, $article_media) {
        $dom = new DOMDocument();
        $dom->loadHTML("<body>{$article}</body>");

        $elements = [];
        $lastType = '';
        $bodyNode = $dom->getElementsByTagName('body')->item(0);

        foreach ($bodyNode->childNodes as $node) {

            $content = $dom->saveHTML($node);
            $content = $this->processAudioTag($content);

            if (str_contains($content, '<p><img src="/serdelia/public/ckeditor/plugins/uho_media/icons/uho_media.png"></p>')) {
                $type = 'image';
                $elements[] = ['type' => $type, 'content' => array_shift($article_media)];
                $lastType = $type;
            }

            else {
                $content = str_replace('<blockquote>', '<blockquote class="quote quote--big">', $content);
                $type = 'text';

                if ($lastType == $type && !empty($elements)) {
                    end($elements);
                    $elements[key($elements)]['content'] .= '<br>' . $content;
                } else {
                    $elements[] = ['type' => $type, 'content' => $content];
                }
                $lastType = $type;
            }


        }

        return $elements;
    }

    private function processAudioTag($content): string {
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

}
?>