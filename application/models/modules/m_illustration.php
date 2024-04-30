<?php

class model_app_pages_modules_illustration extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
		$collections=$this->parent->dictGet('collections');
		shuffle($collections);
		$m['item']=array_shift($collections);

		/*
        $collections = array_filter($collections, function ($item) {
            return isset($item['image']) && $item['image'] != false;
        });
        $m['item'] = $this->getSeedRandomElement($collections);*/

        // this module requires bigger image sizes
        $m['item']['image'] = $this->copyValues($m['item']['image'], 'big', 'desktop');

		return $m;
	}


}
?>