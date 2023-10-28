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

        /*
            duration
        */
        $duration=0;
        foreach ($items as $k=>$v)
            $duration+=$v['duration'];

        /*
            states
        */
        
        $states=[];
        foreach ($items as $k=>$v)
        if ($v['narrator_state'])
            $states[]=$v['narrator_state']['id'];
        
        /*
            locations
        */
        $locations=[];
        foreach ($items as $k=>$v)
        if ($v['narrator_location'])
            $locations[]=$v['narrator_location'];
        $locations=array_unique($locations);
        $locations=implode(', ',$locations);
        
        /*
            save
        */
        $data=[
            'duration'=>$duration,
            'locations'=>$locations,
            'narrators_states'=>$states
        ];
        
            $this->cms->putJsonModel('interviews',
                $data,
                ['id'=>$session['parent']['id']]);
        
        
        $data=['result'=>true,'updated'=>count($items)];
        
        return $data;
    }



}


?>