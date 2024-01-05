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

        // replace desktop size with big size - module design requirement
        $m['item']['image'] = array_filter($m['item']['image'], function($key) {
            return strpos($key, 'desktop') === false;
        }, ARRAY_FILTER_USE_KEY);

        $key_mapping = ['big' => 'desktop', 'big_x2' => 'desktop_x2', 'big_webp' => 'desktop_webp', 'big_x2_webp' => 'desktop_x2_webp'];

        $new_keys = array_map(function($key) use ($key_mapping) {
            return $key_mapping[$key] ?? $key;
        }, array_keys($m['item']['image']));

        $m['item']['image'] = array_combine($new_keys, $m['item']['image']);

		return $m;
	}


}
?>