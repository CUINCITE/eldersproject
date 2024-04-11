<?php

class serdelia_plugin_topic_update
{
    // ------------------------------------------------------------------------------

   public function __construct($cms,$params,$parent)
    {
        $this->cms=$cms;
        $this->params=$params;
        $this->parent=$parent;
    }
    // ------------------------------------------------------------------------------
    public function getData()
    {
        
        $errors=[];
        $success=[];
        $params=$this->params;
        
        $interviews=$this->cms->getJsonModel('interviews',['active'=>1,'topics'=>$params['record']]);
        $this->cms->putJsonModel('topics',['count_interviews'=>count($interviews)],['id'=>$params['record']]);
        
        $data=['result'=>true,'updated'=>count($interviews)];
        
        return $data;
    }



}


?>