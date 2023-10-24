<?php

class model_app_pages_modules_home extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{        
		return $m;
	}


}
?>