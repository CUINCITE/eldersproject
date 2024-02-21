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
			$m['items']=array_slice($m['items'],0,5);
		}        
		
		return $m;
	}


}
?>