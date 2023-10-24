<?php

class model_app_api_profile
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		$data = [
			'name' => $params['profile_name'],
			'surname' => $params['profile_surname'],
		];

		$required=['name','surname'];
		
		foreach ($required as $k=>$v)
		if (!$data[$v]) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$result = $this->parent->client->update(null,$data);
            
			if ($result)
			{
				$result=['result'=>true,'message'=>$this->parent->getTranslated('client_profile_success')];
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