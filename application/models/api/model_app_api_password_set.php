<?php

class model_app_api_password_set
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		if (!$params['profile_password_new'] || !$params['key']) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$result=$this->parent->client->passwordChangeByKey($params['key'],$params['profile_password_new']);

            if ($result['result'])
            {
              $result['message']=$this->parent->getTranslated('client_password_changed');
              $result['result']=true;
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