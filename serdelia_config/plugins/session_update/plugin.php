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

        $output=[
            'status_media'=>empty($session['audio']['src']) ? 0 :1,
            'status_transcript'=>empty($session['doc']['src']) ? 0 :1,
        ];

        if (!$session['duration'] && !empty($session['audio']['src']))
        {
            require(__DIR__.'/Mp3Info.php');
            $src=$_SERVER['HTTP_HOST'].explode('?',$session['audio']['src'])[0];
            if (file_exists($src))
            {
                $audio = new Mp3Info($src);
                $duration=intval($audio->duration);            
                if ($duration) $output['duration']=$duration;
            }
        }
        if (!$session['mp3_size'] && !empty($session['audio']['src']))
        {
            $src=explode('?',$session['audio']['src'])[0];            
            $mp3_size=$this->curl_get_file_size($src);
            
            if ($mp3_size) $output['mp3_size']=$mp3_size;
        }

        $f=['id'=>$session['id']];
        //print_r($session);exit();
        $output['label']=$session['parent']['label'].' ('.$session['parent']['interviewer_name'].')';
        $output['label_sort']=$session['parent']['label_sort'].' ('.$session['parent']['interviewer_name'].')';
        
        
        $this->cms->putJsonModel('sessions_simple',$output,$f);

        return['result'=>true,'error'=>$this->parent->orm->getLastError()];

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

    private function curl_get_file_size( $url ) {
        $ch = curl_init($url);

     curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
     curl_setopt($ch, CURLOPT_HEADER, TRUE);
     curl_setopt($ch, CURLOPT_NOBODY, TRUE);

     $data = curl_exec($ch);
     $size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);

     curl_close($ch);
     return $size;
    
        
    }



}


?>