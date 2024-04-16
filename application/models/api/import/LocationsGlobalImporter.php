<?php

class LocationsGlobalImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/geography.csv', ',');
        $interviews=$this->parent->getJsonModel('interviews',['active'=>1],false,null,null,['fields'=>['slug','label','incite_id']]);
        //print_r($interviews);exit();

        $loc=[];

        foreach ($items as $k=>$v)
        {
            $city=explode(',',$v['Location']);
            $i=_uho_fx::array_filter($interviews,'incite_id',$v['Interview ID'],['first'=>true,'strict'=>true]);
            if (!$i) exit('interview not found: '.$v['Interview ID']);

            $key=_uho_fx::array_filter($loc,'label',$v['Location'],['first'=>true,'keys'=>true]);

            if ($key===null)
            {
                $loc[]=[
                    'city'=>trim($city[0]),
                    'state'=>@trim($city[1]),
                    'label'=>$v['Location'],
                    'quotes'=>[],
                    'active'=>1
                ];

                $key=count($loc)-1;
            }

            $loc[$key]['quotes'][]=
            [
                $i['label'],
                '0:00:00',
                $v['Interview ID']
            ];
            

        }


        $this->parent->sql->queryOut('TRUNCATE TABLE map_locations_global');
        $this->parent->postJsonModel('map_locations_global',$loc,true);
        //exit($this->parent->orm->getLastError());
        return ['result' => true, 'message' => 'Updated location: ' . count($loc)];
    }
}