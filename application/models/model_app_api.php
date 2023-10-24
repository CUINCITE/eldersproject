<?php                               

require_once('model_app.php');
//require(root_url.'/serdelia/shared/uho_thumb.php');


class model_app_api extends model_app
{

	public $cfg;
  public $modal_success,$modal_error;

  //------------------------------------------------------
  private function cacheKill($dir='cache')
  {
    if ($dir)
    {
          $dir=rtrim($_SERVER['DOCUMENT_ROOT'],'/').'/'.trim($dir,'/');
          //ini_set('memory_limit', '256M');
          $scan=@scandir($dir);
          if ($scan)
          foreach ($scan as $item)
          {
              $path_parts = pathinfo($item);
              if ($item == '.' || $item == '..' || $path_parts['extension']!='cache') continue;
              unlink($dir.DIRECTORY_SEPARATOR.$item);
          } 
        }
  }
    //==================================================================================

	public function getApi($action,$object,$url,$params,$get)
	{

    $this->modal_success=[
      'result'=>true,
      'title'=>$this->getTranslated('api_thank_you'),
      'message'=>'',
      'button_title'=>$this->getTranslated('api_back_to_homepage'),
      'button_login'=>false,
      'button_href'=>'/'.$this->lang,
    ];
    $this->modal_error=[
      'result'=>false,
      'message'=>$this->getTranslated('client_system_error')
    ];

		$data=array('result'=>false,'message'=>'Invalid action: ['.$action.']');
		if (isset($params['cfg']))
    {
      $this->cfg=$params['cfg'];
		  $this->cfg['uho_app_config_path']=rtrim($this->cfg['application_base_url'],'/').'/serdelia_config';
    } else  $this->cfg=[];
    $method=$_SERVER['REQUEST_METHOD'];

		switch ($action)
		{

      //-------------------------------------------------------
      case "login":  
      case "profile":  
      case "register":
      case "password_change":
      case "password_reset":
      case "password_set":
  
        require_once ("api/model_app_api_".$action.".php");
        $class = 'model_app_api_'.$action;
        $class= new $class($this,null);
        $result=$class->rest($method,$params);
        $this->cacheKill();
        break;
  
        case "cache_kill":
        $this->cacheKill();
        $result=['result'=>true];
        
        break;
      //-------------------------------------------------------
      case "newsletter_add":
      $result=$this->client->newsletterAdd($params['email'],true,$this->http_server.'/'.$this->lang.'/newsletter-potwierdzenie/%key%');
      $result['title']=$this->getTranslated('newsletter_dziekujemy');
      if ($result['mailing']) $result['message']=$this->getTranslated('newsletter_dziekujemy_potwierdz');
        else $result['message']=$this->getTranslated('dziekujemy'.'.');
      break;

      //-------------------------------------------------------

  
      //------------------------------------------------------------------------------------
			default:
			break;
		}

    if (!$result) $result=['result'=>false];
		return $result;

	}

  //------------------------------------------------------------------------------
  public function captcha($captcha)
  {
    if (!$captcha) return;
    $secret="6LfxzIYUAAAAAEh2mH4CIZmJ0fTuBUAVR7cvAvl9";
    $data = array(
        'secret' => $secret,
        'response' => $captcha
    );

    $verify = curl_init();
    curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
    curl_setopt($verify, CURLOPT_POST, true);
    curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
    $jsonresponse = curl_exec($verify);
    $responseKeys = json_decode($jsonresponse,true);
    if(intval($responseKeys["success"]) == 1) return true;

  }

}
