<?php

class model_app_pages_modules_profile extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        $data=$this->parent->getClient();
        if (!$data) return;
		$m['user']=$data;
		return $m;
	}


}
?>