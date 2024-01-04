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

        $itemsPerPage = 10;
        $page = 1;
        $isPartial = (!empty($this->settings['get']['partial']));

        if (!empty($this->settings['get']['page']) && is_numeric($this->settings['get']['page'])) {
            $page = (int)$this->settings['get']['page'];
        }

        // startingPage & numberOfItems variables are used in getJsonModel method
        $startingPage = $isPartial ? $page : 1;
        $numberOfItems = $isPartial ? $itemsPerPage : $page * $itemsPerPage;

		/*
			FILTERS
		*/

        //filters in the query
		$input=[
			'collections'=>['collections','interviewers'],
			'topics'=>['topics','topics'],
			'states'=>['states','narrators_states']
		];

		$filters=['active'=>1];
		foreach ($input as $param=>$dictionaries)
		{
            $filter = false;

			if (!empty($this->settings['get'][$param]))
			{
				$filter=$this->getModelFilter($dictionaries[0],$this->settings['get'][$param]);
				if (!empty($filter)) $filters[$dictionaries[1]]=$filter;
			}

            $m[$param]=$this->filterUpdate($this->parent->dictGet($dictionaries[0]),$filter);

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

        $m['items']=$this->parent->getJsonModel('interviews_list',$filters,false,$sort_model, [$startingPage, $numberOfItems]);
        $m['items']= array_map(function($item) {
            $item['type'] = 'single';
            if (is_array($item['narrators_states'])) {
                $item['narrators_states'] = array_map("unserialize", array_unique(array_map("serialize", $item['narrators_states'])));
            }
            return $item;
        }, $m['items']);

        /*
			Load more - check if load more items
		*/

        $m['load_more'] = false;

        if (count($m['items']) >=  $itemsPerPage) {
            $startingPage = $page * $itemsPerPage + 1;
            $newItem = $this->parent->getJsonModel('interviews_list',$filters,false,$sort_model, [$startingPage, 1]);
            if ($newItem) $m['load_more'] = $this->getNextPageUri($page);
        }
        
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
        if (!$filters) return $items;

		if (!is_array($filters)) $filters=explode(',',$filters);

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
        $allowedParams = ['page', 'sort', 'collection', 'topic', 'state'];

        $requestUri = $_SERVER['REQUEST_URI'];
        $uri = strtok($requestUri, '?');

        $queryParams = [];
        if (strpos($requestUri, '?') !== false) {
            parse_str(substr($requestUri, strpos($requestUri, '?') + 1), $queryParams);
        }

        $params = array_intersect_key($queryParams, array_flip($allowedParams));

        $params['page'] = $current_page + 1;

        return $uri . '?' . http_build_query($params);
    }

}
?>