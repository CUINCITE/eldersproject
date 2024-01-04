<?php

class model_app_pages_modules_interviews extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        /*
			PAGINATION
		*/

        $items_per_page = 10;

        if (isset($this->settings['get']['page'])
            && is_numeric($this->settings['get']['page']
            && !empty($this->settings['get']['partial']))) {
            $page = $this->settings['get']['page'];
        } else $page = 1;

		/*
			FILTERS
		*/

        // filters available to be selected
        $m['filters']['collections'] = $_SESSION['dict']['collections'];
        $m['filters']['topics'] = $_SESSION['dict']['topics'];
        $m['filters']['states'] = $_SESSION['dict']['states'];


        //filters in the query
		$input=[
			'collection'=>['collections','interviewers'],
			'topic'=>['topics','topics'],
			'state'=>['states','narrators_states']
		];

		$filters=['active'=>1];
		foreach ($input as $k=>$v)
		{
			if (!empty($this->settings['get'][$k]))
			{
				$f=$this->getModelFilter($v[0],$this->settings['get'][$k]);
				if (!empty($f)) $filters[$v[1]]=$f;
			}

            if (!empty($f)) $m[$k]=$this->filterUpdate($this->parent->dictGet($v[0]),$f);

		}

		/*
			Sort
		*/
		$sort=@$this->settings['get']['sort'];		
		if (!$sort) $sort='narrators';
		if ($sort[0]=='!') { $desc=true; $sort=substr($sort,1); } else $desc=false;
		
		$m['sort']=[];
		$m['sort']['url_narrator']=$this->getSort('narrators',$sort,$desc);
		$m['sort']['url_locations']=$this->getSort('locations',$sort,$desc);
		$m['sort']['url_collections']=$this->getSort('collections',$sort,$desc);
		
		$sort_model='label_sort';

		switch ($sort)
		{
			case "narrators":
				$sort_model='label_sort';
				$m['sort']['arrow_narrator']='↓';
				if ($desc)
				{
					$sort_model.=' DESC';
					$m['sort']['arrow_narrator']='↑';
				}
			break;
			case "collections":
				$sort_model='interviewer_name_sort';
				$m['sort']['arrow_collections']='↓';
				if ($desc)
				{
					$sort_model.=' DESC';
					$m['sort']['arrow_collections']='↑';
				}
			break;
			case "locations":
				$sort_model='locations';
				$m['sort']['arrow_locations']='↓';
				if ($desc)
				{
					$sort_model.=' DESC';
					$m['sort']['arrow_locations']='↑';
				}
			break;
		}

		
		

		/*
			Get Interviews
		*/

        $m['items']=$this->parent->getJsonModel('interviews_list',$filters,false,$sort_model, [$page, $items_per_page]);
        $m['items']= array_map(function($item) {
            $item['type'] = 'single';
            return $item;
        }, $m['items']);

        /*
			Load more
		*/

        $m['load_more'] = $this->getNextPageUri($page);

        
		return $m;
	}

	private function getSort($item,$sort_now,$desc_now)
	{
		
		if ($item==$sort_now)
		{			
			$sort=$sort_now;
			if (!$desc_now) $sort='!'.$sort;
		}
			else $sort=$item;

		$url=['type'=>'url_now','get'=>['sort'=>$sort]];
		return $url;
	}

	private function filterUpdate($items,$filters)
	{
		if ($filters && !is_array($filters)) $filters=explode(',',$filters);
		if ($filters)
		{
			foreach ($items as $k=>$v)
				$items[$k]['selected']=in_array($v['id'],$filters);
		}
		return $items;
	}

	private function getModelFilter($dict,$slug)
	{
        $slugs = explode(',', $slug);
        $return_array = [];

        foreach ($slugs as $slug) {
            $item=$this->parent->dictGet($dict,$slug);
            if ($item) $return_array[] = $item['id'];
        }

        if (!empty($return_array)) {
            return (count($return_array) == 1) ? $return_array[0] : $return_array;
        }

        return [];

	}

    function getNextPageUri($current_page): string
    {
        // Allowed query parameters
        $allowedParams = ['page', 'sort', 'collection', 'topic', 'state'];

        // Get current URL without query parameters
        $requestUri = $_SERVER['REQUEST_URI'];
        $uri = strtok($requestUri, '?');

        // Parse the query parameters manually
        $queryParams = [];
        if (strpos($requestUri, '?') !== false) {
            parse_str(substr($requestUri, strpos($requestUri, '?') + 1), $queryParams);
        }

        // Filter out unwanted parameters
        $params = array_intersect_key($queryParams, array_flip($allowedParams));

        // Increment page number
        $params['page'] = $current_page + 1;
        $params['partial'] = true;

        // Build the new URL with updated query parameters
        return $uri . '?' . http_build_query($params);
    }


}
?>