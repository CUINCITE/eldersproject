<?php

class serdelia_plugin_session_update
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
        
        $session=$this->cms->getJsonModel('sessions_simple',['id'=>$params['record']],true);
        $items=$this->cms->getJsonModel('sessions_simple',['parent'=>$session['parent']['id']]);
        $duration=0;
        foreach ($items as $k=>$v)
            $duration+=$v['duration'];
        $this->cms->putJsonModel('interviews',['duration'=>$duration],['id'=>$session['parent']['id']]);
        $data=['result'=>true,'updated'=>count($items)];
        
        return $data;
    }



}


?>