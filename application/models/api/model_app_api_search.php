<?php

class model_app_api_search
{

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    //"_comment": "same structure for: 1)[organizations, events, topics, places, people], 2)[interviews, clips]",

    public function rest($method, $params)
    {
        $q = $this->parent->sqlSafe(@$params['q']);

        require_once (__DIR__.'/../model_app_pages_search.php');
        $search=new model_app_pages_search($this->parent);
        $categories=$search->get($q,true);

        $result = [
            'q'=>$q,
            'results' => $categories,
            "allResultsUrl" => "/search?q=".$q
        ];

        return $result;

    }


}
