<?php

class serdelia_plugin_interview_update
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

        /*
        $this->cms->setFilesDecache(false);
        $this->parent->orm->setFilesDecache(false);

        $record=$this->cms->getJsonModel('interviews',['id'=>$params['record']],true);
        if (!$record['uid'])
        {
            $record['uid']=uniqid();
            $this->cms->putJsonModel('interviews',['uid'=>$record['uid']],['id'=>$params['record']]);
        }
        $items=$this->cms->getJsonModel('sessions',['parent'=>$params['record']]);

        $status_transcripts=0;
        $status_video=0;
        if ($items)
        {
            $status_video=1;
            $status_transcripts=1;
            foreach ($items as $k=>$v)
            {
                
                $status_transcripts=($status_transcripts && strlen($v['transcript_tags'])>100);
                $status_video=($status_video && !empty($v['vimeo_source']));
            }
            
        }

        $val=[
            'status_transcripts'=>intval($status_transcripts),
            'status_video'=>intval($status_video)
        ];
        
        $this->cms->putJsonModel('interviews',$val,['id'=>$record['id']]);
        //exit('!'.$this->parent->apporm->getLastError());
        $clips=$this->cms->getJsonModel('clips',['interview'=>$params['record']],false,'time_from');
        
        // index from clips

        if ($clips)
        {
            $i=[];
            //print_r($clips);
            foreach ($clips as $k=>$v)
            if ($v['time_to'])
            {
                $i[]=[$v['time_from'],$v['label']];
            }
            
            $this->cms->putJsonModel('interviews',
                ['contents'=>$i],
                ['id'=>$record['id']]);
            
        }



        // image update

        if (!_uho_fx::file_exists($record['image']['original']))
        {
            $i=false;
            foreach ($items as $k=>$v)
            if (!$i)
            {
                $i=true;
                $result = $this->parent->imageResizeModel($params['page'], 'image', $record, $v['image']['original']);
                if ($result['result']) $success[]='Image imported';
                else $errors[]='Error converting - '.$result['message'];
    
            }            
        }
        
        $duration=0;
        foreach ($items as $k=>$v)
            $duration+=$v['duration'];
        $this->cms->putJsonModel('interviews',['duration'=>$duration],['id'=>$params['record']]);

        //* update topics.interviews_count
        $items=$this->cms->query('SELECT topics FROM interviews WHERE active=1 && topics!=""');
        $topics=[];
        foreach ($items as $k=>$v)
        {
            $vv=explode(',',$v['topics']);
            foreach ($vv as $kk=>$vvv)
            if (intval($vvv))
            {
                $vvv=intval($vvv);
                if (!isset($topics[$vvv])) $topics[$vvv]=0;
                $topics[$vvv]++;
            }
        }
        if ($topics)
        foreach ($topics as $k=>$v)
            $this->cms->queryOut('UPDATE topics SET count_interviews='.$v.' WHERE id='.$k);

        $data=['result'=>true,'success'=>$success,'errors'=>$errors,'updated'=>count($items)];

        return $data;
        */        
    }



}


?>