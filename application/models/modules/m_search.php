<?php

use Google\Service\Contentwarehouse\GoodocBreakLabel;

class model_app_pages_modules_search extends model_app_pages_modules
{

    function __construct($parent,$settings)
    {
        $this->parent=$parent;
        $this->settings=$settings;
    }

    public function updateModel($m,$url)
    {

        $m['q']=@$this->settings['get']['q'];
        $page=@$this->settings['get']['page'];
        if (!$page) $page=1; else $page=intval($page);

        $transcripts_only = (!empty($this->settings['get']['section']) && $this->settings['get']['section'] == 'transcripts');

        // standard search
        if ($m['q'])
        {
            $m['q']=strip_tags($m['q']);
            require_once (__DIR__.'/../model_app_pages_search.php');
            $search=new model_app_pages_search($this->parent);
            $items=$search->get($m['q'],false,$page, $transcripts_only);

        }

        if (isset($items))
        {
            $m['categories']=[];
            foreach ($items as $k=>$v)
                $m['categories'][$v['category']]=$v;

            $m['amount']=0;
            foreach ($m['categories'] as $k=>$v)
                if (!empty($v['total_count'])) $m['amount'] += $v['total_count'];
                else $m['amount']+=count($v['items']);
        } else $this->parent->is404=true;

        return $m;
    }




}
?>