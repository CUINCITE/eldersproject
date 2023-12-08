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
        $m['items']=$this->parent->getJsonModel('interviews_list_home',['active'=>1],false,'RAND("'.date('Y-m-d').'")','0,3');

		return $m;
	}


}
?>