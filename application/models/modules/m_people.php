<?php

class model_app_pages_modules_people extends model_app_pages_modules
{
	var $parent,$settings;

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        $m['items']=$this->parent->getJsonModel('people_sections',['active'=>1]);
        
		
		return $m;
	}


}
?>