<?php

class model_app_api_register
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		$data = [
			'email' => $params['register_login'],
			'password' => $params['register_password'],
			'name'=>$params['register_name'],
			'surname'=>$params['register_surname'],
			//'institution'=>$params['institution'],
			//'newsletter'=>@$params['newsletter'],
			//'image'=>@$params['photo-url']
		];

		$required=['email','password'];
		
		foreach ($required as $k=>$v)
		if (!$data[$v]) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$r = $this->parent->client->register($data, $this->parent->http_server . '/' . $this->parent->lang . '/register-confirmation/%key%');
			if ($r['result']) {
				$result = $this->parent->modal_success;		
				$result['message'] = $this->parent->getTranslated($r['message']);
			} else $result = $this->modal_error;
		}
		else
		{
			$this->modal_error = [
				'result' => false,
				'message' => 'Błąd weryfikacji Captcha'
			];
		}
		$result = ['result' => $result];

		return $result;
	}
}