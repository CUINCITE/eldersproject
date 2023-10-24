<?php

class model_app_api_password_change
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		$data = [
			'old' => $params['profile_password'],
			'new' => $params['profile_password_new'],
		];

		$required=['old','new'];
		
		foreach ($required as $k=>$v)
		if (!$data[$v]) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$result = $this->parent->client->passwordChangeByOldPassword($data['old'],$data['new']);

			if ($result)
			{
				$result=['result'=>true,'message'=>$this->parent->getTranslated('client_password_changed')];
			}
			else
			  {
				$result=['result'=>false,'message'=>$this->parent->getTranslated('client_system_error')];
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