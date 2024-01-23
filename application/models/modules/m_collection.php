<?php

class model_app_pages_modules_collection extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        //exit($url[1].'!');
        $m['item']=$this->parent->getJsonModel('interviewers',['active'=>1,'slug'=>$url[1]],true);
        if (!$m['item']) $m=null;
		else
		{
        	$m['items']=$this->parent->getJsonModel('interviews',['interviewers'=>$m['item']['id'],'active'=>1],false,'label');
            $m['modules'] =$this->parent->getJsonModel('collection_modules',['parent' => $m['item']['id'],'active'=>1]);
		}

//        dd($m['modules']);
		
		return $m;
	}


}
?>