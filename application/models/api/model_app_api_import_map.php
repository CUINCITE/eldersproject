<?php

use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIOFactory;

class model_app_api_import_map
{

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $action)
    {
        $result = false;
        $message = [];

        require(__DIR__ . '/../../library/vendor/autoload.php');
        $xls=$_SERVER['DOCUMENT_ROOT'].'/_data/_map/map-20230206.xlsx';
        $spreadsheet = ExcelIOFactory::load($xls);

        $collections=$this->parent->getJsonModel('interviewers');
        
        foreach ($collections as $k=>$v)
        {
            $label=$v['label'];
            if ($label=='Caro De Robertis') $label='Carolina De Robertis';
            if ($label=='Eve L. Ewing') $label='Eve Ewing';
            if ($label=='Renée Watson') $label='Renee Watson';
            
            $item=$spreadsheet->getSheetByName($label);
            if ($item)
            {
                $item=$this->convertTable($item->toArray());                
                $message[]=$label.'='.$this->create ($v['id'],$item);
            }
            else $message[]='Not found: '.$label;
        }


        $message=implode(', ',$message);
        $result = ['result' => $result, 'message' => $message];

        return $result;
    }

    private function convertTable($i)
    {
        $result=[];
        $keys=array_shift($i);
        foreach ($i as $k=>$v)
        {
            $r=[];
            foreach ($keys as $kk=>$vv)
            if (isset($v[$kk]))
            {
                $r[$vv]=$v[$kk];
            }
            $result[]=$r;
        }
        return $result;
    }

    private function create ($model_id,$data)
    {
        $fields=[
            'label'=>'Location name',
            'description'=>'1-2 sentence description',
            'address'=>'Location address',
            'quotes'=>'Quotes'
            //'gps'=>'Geo coordinates (if no address is available)'
        ];


        $output=[];
        
        foreach ($data as $k=>$v)
        {
            $r=[];
            foreach ($fields as $kk=>$vv)
            {
                $r[$kk]=isset($v[$vv]) ? $v[$vv] : "";
            }

            if ($r['label']=='Burger Barn') $r['gps']='45.55,-122.66';

            /*
            if (!empty($r['gps']))
            {
                $i=explode(',',$r['gps']);
                if ((is_numeric($i[0])) && (is_numeric(@$i[1])) && $i[0] && $i[1])
                {
                    $r['gps_lat']=1*$i[0];
                    $r['gps_lng']=1*$i[1];                    
                }
                
            }

            if (empty($r['gps_lat'])) $r['gps_lat']=0;
            if (empty($r['gps_lng'])) $r['gps_lng']=0;

            if (isset($r['gps'])) unset($r['gps']);
            */

            if (!empty($r['quotes']))
            {
                $pass=false;
                $r['quotes']=explode('                   ',$r['quotes']);
                foreach ($r['quotes'] as $k=>$v)
                if (trim($v))
                {
                    $i1=strpos($v,'[');
                    $i2=strpos($v,']',$i1);
                    if($i1 && $i2>$i1)
                    {
                        $label=substr($v,0,$i1);
                        $label=_uho_fx::trim($label,'-');
                        $label=trim($label);
                        if ($label[strlen($label)-1]=='-') $label=substr($label,0,strlen($label)-1);
                        
                        $time=substr($v,$i1+1,$i2-$i1);
                        $time=substr($time,0,8);
                        $time=explode(':',$time);
                        if (count($time)>=3)
                        {
                            $time=_uho_fx::dozeruj($time[0],2).':'._uho_fx::dozeruj($time[1],2).':'._uho_fx::dozeruj($time[2],2);
                            $r['quotes'][$k]=[$label,$time];
                            $pass=true;
                        } 
                    }
                    if (!$pass) unset($r['quotes'][$k]);

                } else unset($r['quotes'][$k]);
                $r['quotes']=array_values($r['quotes']);
                
            } else $r['quotes']=[];

            if ($r['label'])
            {
                $r['collection']=$model_id;
                $r['quotes']=json_encode($r['quotes']);
                $r['active']=1;
                $output[]=$r;
            }

            
        }

        
        // deactivate all from this collection
        $this->parent->queryOut('UPDATE map_locations SET active=0 WHERE collection='.$model_id);

        // update one by one
        foreach ($output as $k=>$v)
        {
            $this->parent->putJsonModel('map_locations',$v,['label'=>$v['label'],'collection'=>$v['collection']]);            
        }

        $this->parent->queryOut('UPDATE map_locations SET active=0 WHERE collection='.$model_id.' && gps_lat=0');
        
        return count($output);
    }
}
