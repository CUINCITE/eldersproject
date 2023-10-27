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

        
        $items=$this->cms->getJsonModel('interviews',['interviewers'=>$params['record']],false,null,null,['count'=>true]);
        $r=$this->cms->putJsonModel('interviewers',['amount'=>$items],['id'=>$params['record']]);
        if (!$r) exit('error');
        //$record=$this->cms->getJsonModel('interviews',['id'=>$params['record']],true);
        

        $data=['result'=>true,'interviews'=>$items];

        return $data;
        
    }



}


?>