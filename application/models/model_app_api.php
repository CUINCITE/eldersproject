<?php                               

require_once('model_app.php');

class model_app_api extends model_app
{

	public $cfg;
  public $modal_success,$modal_error;


	public function getApi($action,$object,$url,$params,$cfg)
	{

    $this->modal_success=[
      'result'=>true,
    ];
    $this->modal_error=[
      'result'=>false
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
      case "newsletter":
        if ($this->captcha(@$params['token']))
        {
          require_once ("api/model_app_api_".$action.".php");
          $class = 'model_app_api_'.$action;
          $class= new $class($this,null);
          $result=$class->rest($method,$params);
          $this->cache_kill();
        } else $result=['result'=>false,'message'=>'<span>Sorry!</span><span>ReCaptcha falied, try again.</span>'];
        break;

        case "import":
          
          require_once ("api/model_app_api_".$action.".php");
          $class = 'model_app_api_'.$action;
          $class= new $class($this,null);
          $result=$class->rest($method,$params);
          
          
          break;        

          case "s3cache":
          if (!empty($cfg['s3']))
          {
            require_once ("api/model_app_api_".$action.".php");
            $class = 'model_app_api_'.$action;
            $class= new $class($this,null);
            $result=$class->rest($method,$cfg['s3']);
          }

          
          
          break;        

          case "map":
          
          require_once ("api/model_app_api_".$action.".php");
          $class = 'model_app_api_'.$action;
          $class= new $class($this,null);
          $result=$class->rest($method,$params,$url);
          
          break;        
        /*
        case "index_converter":
          require_once ("api/model_app_api_".$action.".php");
          $class = 'model_app_api_'.$action;
          $class= new $class($this,null);
          $result=$class->rest($method,$params['action'],$params);
          break;*/
          
        case "cache_kill":
        $this->cache_kill();
        $result=['result'=>true];
        
        break;

      //-------------------------------------------------------

  
      //------------------------------------------------------------------------------------
			default:
			break;
		}

    if (empty($result) || !$result) $result=['result'=>false];
    
		return $result;

	}

  //------------------------------------------------------------------------------
  public function captcha($captcha)
  {
    return true;
    if (!$captcha) return;
    $secret=$this->getApiKeys('google_recaptcha');
    if (!$secret) return;
    
    
    $data = array(
        'secret' => $secret['secret'],
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

  //------------------------------------------------------
  public function cache_kill($dir='cache')
  {
    if ($dir)
    {
          $dir=rtrim($_SERVER['DOCUMENT_ROOT'],'/').'/'.trim($dir,'/');
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


}