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
        if (isset($params['transcript']))
        {

            $file=$this->parent->getJsonModel('interviews',['id'=>intval($params['transcript']),'active'=>1],true);
            $lang = isset($params['lang']) ? $params['lang'] : 'en';

            if ($file)
            {
                $src=@$file['pdf_'.$lang]['src'];
                if ($src)
                {
                    $src=explode('?',$src)[0];
                    // local $src=$_SERVER['DOCUMENT_ROOT'].$src;
                    
                    $ext=explode('.',$src);
                    $ext=array_pop($ext);
                    $ext=explode('?',$ext)[0];
                    $filename=$file['label'].'_'.$lang.'.'.$ext;

                    if ($ext=='jpg')
                    {
                        //$type = 'image/jpeg';
                        //header('Content-Type:'.$type);
                        //header('Content-Length: ' . $size);
                        readfile($src);
                    } elseif ($ext=='pdf')
                    {
                        header("Content-type:application/pdf");
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
    }

    // --------------------------------------------------------------------------------

}
