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

            if ($file)
            {
                $src=$file['PDF']['src'];
                $ext=explode('.',$src);
                $ext=array_pop($ext);
                $ext=explode('?',$ext)[0];
                $filename=$file['label'].'.'.$ext;

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

    // --------------------------------------------------------------------------------

}
