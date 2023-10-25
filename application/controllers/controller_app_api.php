<?php

require_once("controller_app.php");

class controller_app_api extends controller_app
{

    //======================================================
    public function getData()
    {

        $root = $this->route->e(0);

        switch ($root) {

            case "map":
            case "timeline":
            
                $action='playlist';
                $object=null;
                $this->get=['id'=>$this->route->e(1),'clip'=>@$this->get['clip']];
                break;

            case "interviews":

                $slug=$this->route->e(1);
                if (substr($slug,0,2)=='c-')
                {
                    $action='playlist';
                    $object=null;
                    $this->get=['id'=>$this->route->e(1)];    
                } else
                {
                    $action='interview';
                    $object=null;
                    $this->get=['slug'=>$slug];
                }
                break;

            case "api":

                $action = $this->route->e(1);
                $object = intval(@$this->route->e(2));

                break;
        }


        if (!$this->post) $this->post = $this->get;
        if (!$action) $action = $this->post['action'];
        parse_str(file_get_contents("php://input"), $put);

        $this->data['content'] = $this->model->getApi($action, $object, $this->route->e(), array_merge($this->get, $this->post, $put), $this->cfg);
        $this->data['content'] = $this->urlUpdate($this->data['content']);
        $this->outputType = 'json';
    }
}
