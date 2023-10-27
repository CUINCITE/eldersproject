<?php




class controller_app extends _uho_controller
{

    public function getData()
    {
        //$ajax=$this->route->isAjax() || _uho_fx::getGet('partial');
        //if ($ajax) $this->view->renderHtmlRoot=false;
        if (isset($this->cfg['serdelia']['serdelia_keys']))
            $this->model->setOrmKeys($this->cfg['serdelia']['serdelia_keys']);

        $this->data=$this->getContentData();
        
        $this->data['development']=development;
        $this->data['scaffold']=array();
        $this->data['scaffold']['menu']=$this->model->getJsonModel('menu',array('type'=>'main','active'=>1),false,'nr');
        $this->data['scaffold']['footer']=$this->model->getJsonModel('menu',array('type'=>'footer','active'=>1),false,'nr');
        $this->data['scaffold']['social']=$this->model->getJsonModel('menu',array('type'=>'social','active'=>1),false,'nr');
        $this->data['scaffold']['serdelia_edit']=$this->model->serdelia_edit;
        $this->data['scaffold']['user']=$this->model->getClient();
        $this->data['head']=$this->model->headGet();
        $this->data['head']['http']=$this->route->getDomain();
        
        if ($this->model->is404) $this->outputType='404';

        if (isset($lang)) $this->data['langs']=$lang;
        $this->data=$this->urlUpdate($this->data);

        $this->data['head']['url']=rtrim($this->route->getUrlNow(),'/');

    }

    //--------------------------------------------------------------------------------

    public function urlUpdate($t)
    {
        $skip=false;
        
        if (is_array($t))
            foreach ($t as $k=>$v)
            {
                $vv=$v;
                $lang=null;
                $hash=null;

                if (substr($k,0,3)==='url' && isset($v['type']))
                {
                    $type=$v['type'];

                    switch ($v['type'])
                    {        

                        case "api":
                        $v='api/'.$v['action'];
                        break;

                        case "url_now_http":
                        $v=$this->route->getUrlNow(true);                    
                        break;

                        case "url_now":
                        $getNew=@$vv['get'];
                        if (!$getNew) $getNew=[];
                        if ($vv['setlang']) $getNew['setlang']='true';

                        if ($getNew) $v=$this->route->getUrlNow(false,'[all]',$getNew,@$v['get_remove'],$vv['lang']);
                            else $v=$this->route->getUrlNow(false,null,null,null,$vv['lang']);

                        $v=rtrim($v,'/');
                        $v=str_replace('=&','&',$v);
                        $skip=true;

                        break;

                        case "facebook":
                        if (isset($v['slug']))
                            $v=_uho_social::getFacebookShare($this->route->getUrl($vv['slug'],true));
                            else $v=_uho_social::getFacebookShare($this->route->getUrlNow(true));
                            
                        break;
                        case "twitter":
                        if (isset($v['slug']))
                            $v=_uho_social::getTwitterShare($this->route->getUrl($vv['slug'],true),$v['title']);
                            else $v=_uho_social::getTwitterShare($this->route->getUrlNow(true),$v['title']);
                        break;
                        case "pinterest":
                        if ($v['slug'])
                            $v=_uho_social::getPinterestShare($this->route->getUrl($vv['slug'],true),$v['title'],$v['image']);
                            else $v=_uho_social::getPinterestShare($this->route->getUrlNow(true),$v['title'],$v['image']);
                        break;
                        case "mail":
                        $v=_uho_social::getEmailShare($this->route->getUrlNow(true),$v['title']);
                        $type='hash';
                        break;

                        case "collection":
                            $v='collections/'.$v['slug'];
                        break;
                        case "interview":
                            $v='interviews/'.$v['slug'];
                        break;



                    }

                    if ($skip) $t[$k]=$v;
                    else if ($type=='hash') $t[$k]=$v;
                    else if (is_array($v));
                    else if (substr($v,0,4)=='http') $t[$k]=$v;
                    else $t[$k]=$this->route->getUrl($v);
                }
                elseif ($v && substr($k,0,3)==='url' && substr($v,0,4)!='http')
                {
                    if ($v=='home') $t[$k]='/';
                    else $t[$k]=rtrim($this->route->getUrl($v),'/');
                }
                elseif (is_array($v)) $t[$k]=$this->urlUpdate($v);
                
                if ($hash) $t[$k].='#'.$hash;


        
        }
        
        return $t;
    }
    //=============================================================
    // put here any actions you want to run BEFORE page is rendered

    public function actionBefore($post,$get)
    {
        $this->post=$post;
        $this->get=$get;  
        
        $result=$this->model->actionBefore($this->route->e(),$get);

        
        
    }



    //=============================================================
    // overwrite this method for getting data from the model
    /*
    public function getDataContent()
    {
        $this->data['content']=$this->model->getContentData();
    }
    */
    //======================================================
    /*
    public function getOutputHtml()
    {
        $this->data['menu']=$this->model->getMenu();
        return parent::getOutputHtml();
    }
    */
    //======================================================

}

?>