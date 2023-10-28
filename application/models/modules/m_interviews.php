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
			Get Interviews
		*/

        $m['items']=$this->parent->getJsonModel('interviews',$filters,false,'label');
        
		return $m;
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