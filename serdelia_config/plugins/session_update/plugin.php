<?php
use wapmorgan\Mp3Info\Mp3Info;

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

        /*
         get mp3 duration
        */
        if (!$session['duration'] && !empty($session['audio']['src']))
        {
            require(__DIR__.'/Mp3Info.php');
            $audio = new Mp3Info($session['audio']['src']);
            $duration=intval($audio->duration);            
            if ($duration)
                $this->cms->putJsonModel('sessions_simple',['duration'=>$duration],['id'=>$session['id']]);
        }


        $items=$this->cms->getJsonModel('sessions_simple',['parent'=>$session['parent']['id']]);

        /*
            duration of all sessions
        */
        $duration=0;
        foreach ($items as $k=>$v)
            $duration+=$v['duration'];

        /*
            are all media available?
        */
        $media=1;
        foreach ($items as $k=>$v)
            if (empty($v['audio']['src'])) $media=0;

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
            'status_media'=>$media,
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