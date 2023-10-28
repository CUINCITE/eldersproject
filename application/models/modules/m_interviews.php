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
			FILTERS
		*/

		$input=[
			'collection'=>['collections','interviewers'],
			'theme'=>['topics','topics'],
			'state'=>['states','narrators_states']
		];

		$filters=['active'=>1];
		foreach ($input as $k=>$v)
		{
			if (!empty($this->settings['get'][$k]))
			{
				$f=$this->getModelFilter($v[0],$this->settings['get'][$k]);
				if ($f) $filters[$v[1]]=$f;
			} else $f=[];
			$m[$k]=$this->filterUpdate($this->parent->dictGet($v[0]),$f);
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
				$sort_model='interviewer_name';
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

        $m['items']=$this->parent->getJsonModel('interviews_list',$filters,false,$sort_model);
        
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
		$item=$this->parent->dictGet($dict,$slug);
		if ($item) return $item['id'];
	}


}
?>