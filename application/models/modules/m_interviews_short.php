<?php

class model_app_pages_modules_interviews_short extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        $m['items']=$this->parent->getJsonModel('interviews',['active'=>1],false,'RAND()','0,3');
        
		return $m;
	}


}
?>