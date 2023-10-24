<?php

class model_app_api_password_reset
{

	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{

		if (!$params['login']) return['result'=>false,'message'=>$this->parent->getTranslated('client_required_fields_missing')];


		if (1 == 1 || $this->parent->captcha($params['token']))
		{			
			$result=$this->parent->client->passwordChangeByEmail($params['login'],$this->parent->http_server.'/'.$this->parent->lang.'/password-reset/%key%');
            if ($result['result'] || @$result['code']!='client_system_error')
            {
              $result['message']=$this->parent->getTranslated('client_password_reset_sent');
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