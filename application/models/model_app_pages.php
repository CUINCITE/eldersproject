<?php                               

require_once('model_app.php');
require_once('model_app_pages_modules.php');

class model_app_pages extends model_app
{
	public $is404;
	public $lightbox=[];
	private $parent_vars=[];
	var $isError;

	// ----------------------------------------------------------------------------------------------------------------
	// get Page content
	// ----------------------------------------------------------------------------------------------------------------
	public function getContentData($params=null)
	{

		$url=$params['url'];
		if (!$url) $url='/';
		$urlArr=explode('/',$url);

		if ($urlArr[0]=='module' && $urlArr[1])
		{
			$page=$this->query('SELECT pages.url FROM pages,pages_modules WHERE pages_modules.id='.intval($urlArr[1]).' && pages.id=pages_modules.parent',true);
			if ($page)
			{
				header("Location:/".$page['url'].'?preview=true');
				exit();
			}
		}

		if (!$this->is404) $page=$this->findPage($url);
		
		if ($page)
		{
			$this->ogSet($page['title'],$page['description'],$page['image']['medium']);
			if (substr($urlArr[0],0,17)=='serdelia-preview-') $urlArr=explode('/',$page['url']);
			$page=$this->updatePage($page,$urlArr,$params['get']);
		}
		
		if ($page && !$page['modules'])
		{			
			$this->ogSet($page['title'],$page['description'],$page['image']['medium']);
			if (substr($urlArr[0],0,17)=='serdelia-preview-') $urlArr=explode('/',$page['url']);
			$page=$this->updatePage($page,$urlArr,$params['get']);
		}


		if (!$page || !$page['modules'] || $this->is404)
		{
			//$this->is404=true;
			$page=$this->getJsonModel('pages',['slug'=>'404'],true);
			$page=$this->updatePage($page,$urlArr,$params['get']);
		}

		return $page;
	}

	// ----------------------------------------------------------------------------------------------------------------
	// find PAGE by URL
	// ----------------------------------------------------------------------------------------------------------------

	private function findPage($url)
	{
		$page=null;
		$url=explode('/',$url);
		if (!$url[0]) $url=['home'];

		if (substr($url[0],0,17)=='serdelia-preview-')
		{
			$q='SELECT id,url FROM pages WHERE id='.intval(substr($url[0],17));
			$p=$this->query($q,true);
			return $p;
		}
		else $q='SELECT id,url FROM pages WHERE active=1 && (url LIKE "%;'.$url[0].'%" || url LIKE "'.$url[0].'%")';

		$p=$this->query($q,false);

		$pages=[];
		foreach ($p AS $k=>$v)
		{
			$vv=explode(';',$v['url']);
			foreach ($vv as $k2=>$v2)
				if ($v2) $pages[]=['id'=>$v['id'],'url'=>explode('/',$v2),'power'=>0];
		}
		foreach ($pages as $k=>$v)
		{
			if (count($url)!=count($v['url'])) unset($pages[$k]);
			else
			foreach ($url as $k2=>$v2)
			if ($pages[$k])
			{

				$power=0;
				if ($v['url'][$k2]==$v2) $power=10;
				elseif ($v['url'][$k2]=='%') $power=3;
				else
				{
					unset($pages[$k]);
				}
				if ($power) $pages[$k]['power']+=$power;
			}
			

		}

		if ($pages)
		{
			$pages=_uho_fx::array_multisort($pages,'power');
			$page=array_pop($pages);
			$page=$this->getJsonModel('pages',array('id'=>$page['id']),true);
		}
		
		return $page;


	}
	
	// ----------------------------------------------------------------------------------------------------------------
	// update PAGE including modules
	// ----------------------------------------------------------------------------------------------------------------

	private function updatePage($page,$urlArr,$getArr)
	{

			$page['serdelia_edit']=$this->serdelia_edit;
			if ($this->serdelia_edit) $page['serdelia_page_id']=$page['id'];

			//$page['url']=$url;
			$page['modules']=$this->getJsonModel('pages_modules',['parent'=>$page['id'],'active'=>1],false,'level',null,['page_update'=>true]);
			$page['modules']=$this->updateModules($page['modules'],$urlArr,$getArr);
			$page['title']=$this->headGet()['title'];

			if ($this->lightbox)
			{
			$lightbox=[
				'url'=>$this->lightbox_slug,
				'backUrl'=>'/',
				'items'=>$this->lightbox
			];
			$page['lightbox']=$lightbox;
			}
			return $page;
	}

	public function addLightbox($slug,$label,$vimeo,$mp4=null,$title=null,$poster=null)
	{
		if ($vimeo)
		$this->lightbox[]=
			[
				'url'=>$slug,'vimeo'=>['id'=>$vimeo,'controls'=>true,'size'=>'contain'],
				'label'=>$label,
					'share'=>[
						'url_facebook'=>['type'=>'facebook','slug'=>$slug],
						'url_twitter'=>['type'=>'twitter','slug'=>$slug],
						'url_pinterest'=>['type'=>'pinterest','slug'=>$slug]
					]
			];
			else
			{

			$ii=
			[
				'url'=>$slug,
				'label'=>$label,
				'video'=>['src'=>$mp4['src'],'src_mobile'=>$mp4['src_mobile'],					
					'controls'=>true,'size'=>'contain',
					'poster'=>$mp4['poster'],
					'poster_mobile'=>$mp4['poster_mobile']
				],
				'share'=>[
					'url_facebook'=>['type'=>'facebook','slug'=>$slug],
					'url_twitter'=>['type'=>'twitter','slug'=>$slug,'title'=>$title],
					'url_pinterest'=>['type'=>'pinterest','slug'=>$slug,'title'=>$title,'image'=>$poster]
				]

			];
			if (count($this->lightbox)<10) $ii['instant']=true;
			$this->lightbox[]=$ii;
			}
	}
	public function setLightboxSlug($slug)
	{
		$this->lightbox_slug=$slug;
	}



	// ----------------------------------------------------------------------------------------------------------------
	// update all page modules
	// ----------------------------------------------------------------------------------------------------------------
	private function updateModules($m,$url,$get)
	{
		if ($m)
		{
			$modules=new model_app_pages_modules($this);
			$i=0;
			foreach ($m as $k=>$v)
			{
				$m[$k]=$modules->updateModule($v,$url,$get);

				if ($m[$k])
				{
					if ($this->serdelia_edit)
					{
						$m[$k]['serdelia_id']=$v['id'];
						$m[$k]['serdelia_type']='standard';
						$m[$k]['serdelia_model']=$_SESSION['serdelia_pro']['model'];
						
						if ($this->serdelia_edit==='serdelia_edit_pro')
						{
							$m[$k]['serdelia_type']='pro';
							$m[$k]['serdelia_class']='serdelia-pro-wrapper';
							$m[$k]['serdelia_pro_type']=$m[$k]['serdelia_pro_type'];
							if ($m[$k]['serdelia_pro_model']) $m[$k]['serdelia_model']=$m[$k]['serdelia_pro_model'];
						}
						
							else $m[$k]['serdelia_class']='serdelia-wrapper';
						
					}


					$i++;
					if ($i==2) $m[$k]['id']='section-first'; else $m[$k]['id']='section-'.$i;
					if (isset($v['param']))
					{
						$m[$k]['params']=array_flip(explode(',',$v['param']));
					}
					$m[$k]['url_base']='/';
					$m[$k]['url_now_http']=['type'=>'url_now_http'];
					/*$m[$k]['share']=[
						'url_facebook'=>['type'=>'facebook'],
						'url_twitter'=>['type'=>'twitter']
					];*/
				} else unset($m[$k]);
			}
		}
		$m=array_values($m);
		return $m;
	}

	public function setParentVar($key,$value)
	{
		$this->parent_vars[$key]=$value;
	}
	public function getParentVar($key)
	{
		return @$this->parent_vars[$key];
	}




}

?>