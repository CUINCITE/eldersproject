<?php

class model_app_api_login
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		$data = [
			'email' => $params['login_login'],
			'password' => $params['login_password'],
		];

		$required=['email','password'];
		
		foreach ($required as $k=>$v)
		if (!$data[$v]) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$result = $this->parent->client->login($data['email'], $data['password']);

			if (!$result['result'])
			{
				$result['message']=$this->parent->getTranslated($result['message']);
			}
			else
			  {
				$url=@$_SESSION['login-save-url'];
				$result['url']=$url;
				$result['message'] = $this->parent->getTranslated($result['message']);
			  }

			
		}
		else
		{
			$result = [
				'result' => false,
				'message' => 'Błąd weryfikacji Captcha'
			];
		}

		return $result;
	}
}