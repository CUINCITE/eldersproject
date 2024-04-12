<?php

class serdelia_plugin_sessions_check
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

        
        //$this->cms->setFilesDecache(false);
        //$this->parent->orm->setFilesDecache(false);

        $items=$this->parent->getJsonModel('sessions_list',['active'=>1],false,null,null,['fields'=>['id','uid','label','incite_id','languages','nr','parent']]);
        $s3=$this->parent->s3->getCache(false);
        //print_r($s3);exit('!');

        foreach ($items as $k=>$v)
        if ($v['parent']['active'])
        {
            $items[$k]['mp3']=@$s3['sessions/audio/'.$v['uid'].'.mp3'];
            $items[$k]['docx']=@$s3['sessions/transcripts/'.$v['uid'].'.docx'];
            $items[$k]['pdf_en']=@$s3['interviews/transcripts/'.$v['parent']['uid'].'_EN.pdf'];
            if (strpos($v['languages'],'02'))
                $items[$k]['pdf_es']=@$s3['interviews/transcripts/'.$v['parent']['uid'].'_ES.pdf'];
                else $items[$k]['pdf_es']='none';
            
        } else unset($items[$k]);

        $data=['result'=>true,'success'=>$success,'errors'=>$errors,'items'=>$items];
        
        return $data;
    }



}


?>