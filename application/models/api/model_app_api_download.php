<?php

/**
 * Download proxy method
 */

class model_app_api_download
{


    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $params)
    {
        $src='';
        if (isset($params['transcript']))
        {
            $file=$this->parent->getJsonModel('interviews',['incite_id'=>($params['transcript']),'active'=>1],true);
            $lang = isset($params['lang']) ? $params['lang'] : 'en';
                $src=@$file['pdf_'.$lang]['src'];
                if (!$src) $src=@$file['pdf_'.$lang]['src'];

        }
        elseif (isset($params['mp3']))
        {
            $file=$this->parent->getJsonModel('sessions',['incite_id'=>($params['mp3']),'active'=>1],true);                        
            if ($file) $src=$file['audio']['src'];
            
        }

            if ($src)
            {
                

                if ($src)
                {
                    $src=explode('?',$src)[0];
                    // local $src=$_SERVER['DOCUMENT_ROOT'].$src;
                    
                    $ext=explode('.',$src);
                    $ext=array_pop($ext);
                    $ext=explode('?',$ext)[0];
                    

                    if ($ext=='pdf')
                    {
                        $filename=$file['slug'].'-transcript-'.$lang.'.'.$ext;
                        header("Content-type:application/pdf");
                        header("Content-Disposition:attachment;filename=".$filename);
                        readfile($src);
                    } elseif ($ext=='mp3')
                    {
                        $filename=$file['parent']['slug'].'-audio-'.$file['nr'].'.'.$ext;
                        header("Content-type:audio/mpeg");
                        header("Content-Disposition:attachment;filename=".$filename);
                        readfile($src);
                    }
                    elseif ($ext=='zip')
                    {
                        header("Content-type:application/zip");
                        header("Content-Disposition:attachment;filename=".$filename);

                        readfile($src);
                    }
                    exit();
                }
            }
        
    }

    // --------------------------------------------------------------------------------

}
