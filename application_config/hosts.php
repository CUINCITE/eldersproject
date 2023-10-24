<?php

$cfg_domains = [

	getenv('DOMAIN') =>
	[
		'sql_host' =>                                       getenv('SQL_HOST'),
		'sql_user' =>                                       getenv('SQL_USER'),
		'sql_pass' =>                                       getenv('SQL_PASS'),
		'sql_base' =>                                       getenv('SQL_BASE'),
		'smtp' =>
		[
			'server' => getenv('SMTP_SERVER'),
			'port' => getenv('SMTP_PORT'),
			'secure' => getenv('SMTP_SECURE'),
			'login' => getenv('SMTP_LOGIN'),
			'pass' => getenv('SMTP_PASS'),
			'fromEmail' => getenv('SMTP_LOGIN'),
			'fromName' => getenv('SMTP_NAME')
		],
		'clients' =>
		[
			'google' => [getenv('GOOGLE_OAUTH_ID'),getenv('GOOGLE_OAUTH_SECRET')],
			'facebook' => [getenv('FACEBOOK_OAUTH_ID'),getenv('FACEBOOK_OAUTH_SECRET')],
			'ga' => getenv('GOOGLE_ANALYTICS_TAG')			
		],
		's3'=>
		[
			'key'=>'',
			'secret'=>'',
			'bucket'=>'',
			'region'=>'eu-central-1'
		]
	]
];

$cfg_domains['localhost']=$cfg_domains[getenv('DOMAIN')];