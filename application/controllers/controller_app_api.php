<?php

require_once("controller_app.php");           

class controller_app_api extends controller_app
{

    //======================================================
    public function getData()
    {
        $action=$this->route->e(1);
        $object=intval(@$this->route->e(2));
        if (!$this->post) $this->post=$this->get;
        if (!$action) $action=$this->post['action'];
        parse_str(file_get_contents("php://input"),$put);

        $this->data['content']=$this->model->getApi($action,$object,$this->route->e(),array_merge($this->get,$this->post,$put),$this->cfg);
        $this->data['content']=$this->urlUpdate($this->data['content']);
        $this->outputType='json';
    }

}

?>