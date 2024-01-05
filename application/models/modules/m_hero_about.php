<?php

class model_app_pages_modules_hero_about extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
		$collections=$this->parent->dictGet('collections');
        $m['item'] = $collections[array_rand($collections)];
		return $m;
	}


}
?>