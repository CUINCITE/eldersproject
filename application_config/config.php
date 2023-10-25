<?php

$cfg= array(
		'application_class' =>			     'app',
		'application_languages' =>		   	 ['en'],
		'application_languages_url' =>	 	 false,
		'application_replace' => 		     array(),
		'application_url_prefix' =>'',
		'application_public_path' =>	    '/public',
		'keys'=>[
			getenv('CLIENT_KEY1'),
			getenv('CLIENT_KEY2')
		],
		'common_shared_url' =>			    '/shared',
		'common_cache_dir' =>			    '/cache',
		'clients'=>
		[
			'password_salt'      =>  getenv('CLIENT_PASSWORD_SALT')
		]		

	);


?>