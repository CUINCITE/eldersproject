<?php

/**
 * narrators_categories  method
 */

class model_app_api_narrators_categories
{


    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    

    public function rest($method, $params)
    {
        $empty=[];
        $cats=$this->parent->getJsonModel('narrators_categories');
        foreach ($cats as $k=>$v)
            $cats[$k]['keywords']=explode(',',strtolower($cats[$k]['keywords']));

        $items=$this->parent->getJsonModel('narrators');
        $i=0;
        foreach ($items as $k=>$v)
        if ($v['occupation'])
        {
            
            $c=[];
            foreach ($cats as $k2=>$v2)
                foreach ($v2['keywords'] as $k3=>$v3)
                if ($v3 && strpos(' '.strtolower($v['occupation']),trim($v3)))
                    $c[]=$v2['id'];

            if ($c)
            {
                $i++;
                $c=array_unique($c);
                $this->parent->putJsonModel('narrators',['narrators_categories'=>$c],['id'=>$v['id']]);
            } else $empty[]=$v['occupation'];
            
        }

        return['count'=>$i,'empty'=>$empty];
    }

    // --------------------------------------------------------------------------------

}
