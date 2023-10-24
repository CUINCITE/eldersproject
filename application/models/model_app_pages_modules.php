<?php


class model_app_pages_modules
{

	public $m,$lang,$lang_add;
	private $iModule=0;
	private $parentVars=[];
	private $debug_hr='---------------------------------------------------------------------------------
	';

    function __construct($m)
    {
    	$this->parent=$m;
    	$this->lang_add=$m->lang_add;
    	$this->lang=$m->lang;

	}
	
	// ----------------------------------------------------------------------------------------------------------------
	// update single module
	// ----------------------------------------------------------------------------------------------------------------

	public function updateModule ($m,$url,$get)
	{
		// debug
		$enter=chr(13).chr(10);
		$this->iModule++;
		if (isset($get['dbg']) && $get['dbg']) echo($enter.'<!-- '.$this->debug_hr.$this->iModule.'. MODULE '.$m['type']['slug'].' -->'.$enter);
		$self=$m['type']['slug'];

		// paging
		if (isset($get['page'])) $page=intval($get['page']);
		if (!isset($page) || !$page) $page=1;

		// default filters
		$filters=[];
		if (!isset($get['preview'])) $filters['active']=1;

		$f_title=$f_label=$filters;
		$f_label=['label'.$this->lang_add=>['operator'=>'!=','value'=>'']];
		$f_title=['title'.$this->lang_add=>['operator'=>'!=','value'=>'']];
		
		// module params
		if ($m['params'])
		{
			$m['params']=array_flip(explode(',',$m['params']));
			foreach ($m['params'] as $k=>$v) $m['params'][$k]=1;
		}

		$settings=[
			'f_title'=>$f_title,
			'f_label'=>$f_label,
			'url'=>$url,
			'get'=>$get
		];

		// common
		$m['preview']=isset($get['preview']);
		$m['lang']=$this->lang;
		$m['links']=
		[
			'url_home'=>'',
			'url_back'=>'',
			'url_facebook'=>['type'=>'facebook','title'=>'Zabytek.pl'],
			'url_twitter'=>['type'=>'twitter','title'=>'Zabytek.pl'],
			'url_mail'=>['type'=>'mail','title'=>'Zabytek.pl']


		];
		

		if (_uho_fx::file_exists('/application/models/modules/m_'.$self.'.php'))
		{
			require_once 'modules/m_'.$self.'.php';
			$module_model='model_app_pages_modules_'.$self;
			$class=new $module_model($this->parent,$settings);
			$m=$class->updateModel($m,$url);
			if ($m && isset($m['og'])) $this->parent->ogSet($m['og']['title'],$m['og']['description'],$m['og']['image']);
		}
			


		return $m;
	}

	public function addLightbox($slug,$label,$vimeo,$mp4=null,$title=null,$poster=null)
	{
		if ($vimeo || $mp4)
			$this->m->addLightbox($slug,$label,$vimeo,$mp4,$title,$poster);
	}
	public function setLightboxSlug($slug)
	{
		$this->m->setLightboxSlug($slug);
	}

		
}

?>