<?php

class model_app_pages_modules_interviews_banner extends model_app_pages_modules
{

    function __construct($parent,$settings)
    {
        $this->parent=$parent;
        $this->settings=$settings;
    }

    public function updateModel($m,$url)
    {
        $m['items'] = $this->parent->getJsonModel('interviews', ['active' => 1, 'featured' => 1], null, null, 5);

        foreach ($m['items'] as $k=>$v) {
            if (!empty($k['media'][0]['image']['desktop']['src'])) {
                unset($m['items'][$k]);
            }
        }

        return $m;
    }


}
?>