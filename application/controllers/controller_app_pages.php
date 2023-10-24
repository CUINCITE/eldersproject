<?php

require_once("controller_app.php");           

class controller_app_pages extends controller_app
{

    //======================================================
    public function getContentData()
    {
        $pathNow=$this->route->getPathNow();
        $data['content']=$this->model->getContentData(array('url'=>$pathNow,'get'=>$this->get));
        $data['view']='pages';
        if (!$data['content']) $data=$this->get404();
        return $data;
    }
	

}

?>