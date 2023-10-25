<?php

/**
 * Download proxy method
 */

class model_app_api_s3cache
{


	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{
        require_once (__DIR__.'/../../_uho/_uho_s3.php');
		$s3=new _uho_s3($params,false);
        if ($s3->ready()) return $s3->buildCache();        
        else return['result'=>false,'message'=>'config not complete'];
	}

	// --------------------------------------------------------------------------------

}
