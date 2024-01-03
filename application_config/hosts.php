<?php

if (!getenv('DOMAIN')) exit('ENV.DOMAIN undefined');

$cfg_domains = [

	getenv('DOMAIN') =>
	[
		'sql_host' =>                                       getenv('SQL_HOST'),
		'sql_user' =>                                       getenv('SQL_USER'),
		'sql_pass' =>                                       getenv('SQL_PASS'),
		'sql_base' =>                                       getenv('SQL_BASE'),
        'upload_server' =>                                  getenv('UPLOAD_SERVER'),
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
		'api_keys' =>
        [
            'ga' => getenv('GOOGLE_ANALYTICS_TAG'),
            'google_recaptcha' =>
                [
                    'public' => getenv('GOOGLE_RECAPTCHA_PUBLIC'),
                    'secret' => getenv('GOOGLE_RECAPTCHA_SECRET')
                ],
            'mailchimp' => [
                'key' => getenv('MAILCHIMP_KEY'),
                'list_id' => getenv('MAILCHIMP_LIST_ID')
            ]
        ],
		'clients' =>
		[
			'google' => [getenv('GOOGLE_OAUTH_ID'),getenv('GOOGLE_OAUTH_SECRET')],
			'facebook' => [getenv('FACEBOOK_OAUTH_ID'),getenv('FACEBOOK_OAUTH_SECRET')],
			'ga' => getenv('GOOGLE_ANALYTICS_TAG')			
		]		
	]
];


if (getenv('S3_HOST'))
$cfg_domains[getenv('DOMAIN')]['s3']=
		[
			'host' =>	getenv('S3_HOST'),
			'key' =>	getenv('S3_KEY'),
			'secret' =>	getenv('S3_SECRET'),
			'bucket' =>	getenv('S3_BUCKET'),
			'region' =>	getenv('S3_REGION'),
			'folder' =>	getenv('S3_FOLDER'),
			'cache' => '/cache/s3.files'			];

$cfg_domains['localhost']=$cfg_domains[getenv('DOMAIN')];