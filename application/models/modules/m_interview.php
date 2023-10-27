<?php

class model_app_pages_modules_interview extends model_app_pages_modules
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function updateModel($m,$url)
	{
        //exit($url[1].'!');
        $m['item']=$this->parent->getJsonModel('interviews',['active'=>1,'slug'=>$url[1]],true);
        if (!$m['item']) unset($m); else
		{
			$m['sessions']=$this->parent->getJsonModel('sessions',['active'=>1,'parent'=>$m['item']['id']],false,'nr');
			$date1=$m['sessions'][0]['date'];
			$date2=$m['sessions'][count($m['sessions'])-1]['date'];
			if ($date1==$date2) $m['item']['date']=_uho_fx::convertSingleDate($date1,'en')['long_short_month'];
			else $m['item']['date']=_uho_fx::getDate($date1,$date2,'en')['long_no_time'];

		}
        
        
		return $m;
	}


}
?>