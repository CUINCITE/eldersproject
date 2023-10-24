<?php


$cfg=array(

		'application_url_prefix'=>'serdelia',
		'application_languages' => ['pl','en'],
		'application_languages_url'=>true,
		'clients'=>
		[
			'password_salt'      =>  getenv('CLIENT_PASSWORD_SALT'),  	// password salt
			'password_expired'	=>  365,								// password expired in days
			'password_hash' => 'password',								// password hash type
			'password_required'  =>  '8,1,1,1,1',       				//  password minimum length, minimum a-z letters length, minimum A-Z letters, minimum digits, minimum special chars 
			'max_bad_login'=>	5           				//  maximum invalid logins before locking the website
		],

		'serdelia'=>
		[
			'title'          =>  'UhoMvc8',
			'logotype'       =>	  true,
			
			'serdelia_base_url'       =>  "/serdelia/",           		//  folder with serdelia CORE files
    		'serdelia_languages_url'  =>	true,                        //  put language string in serdelia URL      		
    		
    		'serdelia_keys'=>[
				getenv('CLIENT_KEY1'),
				getenv('CLIENT_KEY2')
			],

			'serdelia_cache_kill'      =>  '/cache',                    //  set cache folder of your website, so after any change in the CMS this folder will be cleared by the CMS (all files will be removed!)

			'app_languages' 			=> 
				[
					['suffix'=>'_PL','label'=>"Polski",'shortcut'=>"PL"],
					['suffix'=>'_EN','label'=>"English",'shortcut'=>"EN"]
				]
			]
		
);


?>