<?php

class model_app_pages_modules_password_reset_set extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        $m['key']=$url[1];
		return $m;
	}


}
?>