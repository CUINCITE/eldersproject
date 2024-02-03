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
        $c=$this->parent->getJsonModel('narrators_categories');
        $cats=[];
        foreach ($c as $k=>$v) $cats[$v['id']]=$v;
        
        foreach ($cats as $k=>$v)
        {
            $cats[$k]['keywords']=explode(',',strtolower($cats[$k]['keywords']));
            $cats[$k]['amount']=0;
        }

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
                foreach ($c as $k2=>$v2)
                    $cats[$v2]['amount']++;

                $this->parent->putJsonModel('narrators',['narrators_categories'=>$c],['id'=>$v['id']]);
            } else $empty[]=$v['occupation'];
            
        }

        foreach ($cats as $k=>$v)
            $this->parent->putJsonModel('narrators_categories',['amount'=>$v['amount']],['id'=>$v['id']]);

        return['count'=>$i,'empty'=>$empty];
    }

    // --------------------------------------------------------------------------------

}
