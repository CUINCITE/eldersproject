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
                    $m['modules'][$k]['article'] = $this->updateArticle($v['text']);
                }
            }
		}

//        dd($m);
		
		return $m;
	}

    public function updateArticle($article)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($article);
        $xpath = new DOMXPath($dom);

        $elements = [];
        $lastType = '';
        foreach ($dom->getElementsByTagName('*') as $node) {

            if ($node->nodeName == 'p') {
                if($lastType == 'text') {
                    $elements[count($elements) - 1]['content'] .= '<br>' . $dom->saveHTML($node);
                } else {
                    $elements[] = ['type' => 'text', 'content' => $dom->saveHTML($node)];
                    $lastType = 'text';
                }
            }
            // You can add further elseif here for handling further types e.g.
           elseif ($node->nodeName == 'blockquote') {
                $content = $dom->saveHTML($node);
               $content = strip_tags($content);


               $elements[] = ['type' => 'quote', 'content' => $content, 'clip' => ['id' => 6, 'start' => 21, 'end' => 41]];
               $lastType = 'quote';
           }
        }

        return $elements;
    }

    private function getAudioLinks($string)
    {
        $pattern = '/\[AUDIO=(\d+), (\d+:\d+:\d+)-(\d+:\d+:\d+)\]/';
        preg_match($pattern, $string, $matches);

        return $matches;

    }


}
?>