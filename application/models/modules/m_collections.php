<?php

class model_app_pages_modules_collections extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        $m['items']=$this->parent->dictGet('collections');		
		return $m;
	}


}
?>