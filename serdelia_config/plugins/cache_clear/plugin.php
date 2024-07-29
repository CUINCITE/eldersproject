<?php

class serdelia_plugin_cache_clear
{
    // ------------------------------------------------------------------------------

    public function __construct($cms, $params, $parent = null)
    {
        $this->cms = $cms;
        $this->params = $params;
        $this->parent = $parent;
    }

    // ------------------------------------------------------------------------------
    public function getData()
    {

        $errors = [];
        $success = [];

        $url = 'https://'.$_SERVER['HTTP_HOST'].'/api/cache_kill';
        if (strpos($_SERVER['HTTP_HOST'],'.lh') || strpos(' '.$_SERVER['HTTP_HOST'],'staging'))
            $url=str_replace('https','http',$url);
            $ii=0;
            $max = 5;
            $r=0;
            for ($i = 0; $i < $max; $i++)
            {
                $data = _uho_fx::fileCurl($url);
                if ($data)
                    $data = json_decode($data, true);
                
                if (isset($data['result']) && $data['result'])
                    { $r++; $ii+=$data['count']; }
            }
    
            if ($r == $max)
                $success[] = 'SQL cache has been cleared. Files: '.$ii.' with '.$url;
            else
                $errors[] = 'Some problems with SQL cache occured (batches: '.$r.', files removed: '.$ii.') with '.$url;


        $data = ['result' => true, 'success' => $success, 'errors' => $errors];

        return $data;
    }

}

?>