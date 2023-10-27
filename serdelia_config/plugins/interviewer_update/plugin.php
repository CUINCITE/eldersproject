<?php

class serdelia_plugin_interviewer_update
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

        
        $items=$this->cms->getJsonModel('interviews',['narrators'=>$params['record']],false,null,null,['count'=>true]);
        $this->cms->putJsonModel('interviewers',['amount'=>$items],['id'=>$params['record']]);
        //$record=$this->cms->getJsonModel('interviews',['id'=>$params['record']],true);
        

        $data=['result'=>true];

        return $data;
        
    }



}


?>