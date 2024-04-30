<?php

class model_app_pages_modules_collections_short extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{		
		$m['items']=$this->parent->dictGet('collections');
		if (!empty($m['params']['home']))
		{
            $seed = date('z');
            mt_srand($seed);
			shuffle($m['items']);

			// remove april reign as interviews below has the same image
			if ($m['items'][0]['slug']=='april-reign') array_shift($m['items']);
			
			$m['items']=array_slice($m['items'],0,5);
		}

        $m['text'] = str_replace("The ", "The&nbsp;", $m['text']);
		
		return $m;
	}

}
?>