<?php

/*
    Imports Map Data from XLS created from Google Docs Sheet
    GPS values to be added in the CMS via GPS INPORT plugin
*/

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
        set_time_limit(512);
        ini_set('memory_limit', '512M');

        $result = false;
        $message = [];

        require(__DIR__ . '/../../library/vendor/autoload.php');
        $xls=$_SERVER['DOCUMENT_ROOT'].'/_data/_map/Map locations and excerpts.xlsx';
        $spreadsheet = ExcelIOFactory::load($xls);

        $collections=$this->parent->getJsonModel('interviewers');

        $locations = [];
        
        foreach ($collections as $k=>$v)
        //if ($v['label']=='Denice Frohman')
        {
            
            $label=$v['label'];
            if ($label=='Caro De Robertis') $label='Caro De Robertis';
            if ($label=='Eve L. Ewing') $label='Eve Ewing';
            if ($label=='Renée Watson') $label='Renee Watson';
            if ($label=='Jenna Wortham') $label='J Wortham';

            
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
        $not_parsed = [];
        $locations = [];

        foreach ($i as $k=>$item) {

            if ($k==0) {
                foreach ($item as $key=>$val) {
                    if ($val == 'Location address') $address_key = $key;
                    if ($val == 'Geo coordinates (if no address is available)') $gps_key = $key;
                }
            }

            if (empty($address_key) || empty($gps_key)) {
                dd('keys not found');
            }

            // add new location
            if (!empty($item[0]) && $k!==0) {


                $new_location = [
                    'label' => $item[0],
                    'description' => $item[1],
                    'address' => $item[$address_key],
                    'quotes' => []
                ];

                if (!empty($item[$address_key]) || !empty($item[$gps_key])) {

                    $coord = false;

                    if (!empty($item[$address_key])) {
                        $coord = $this->parseCoordinates($item[$address_key]);
                    }

                    if (!$coord && !empty($item[$gps_key])) {
                        $coord = $this->parseCoordinates($item[$gps_key]);
                    }

                    if ($coord && !empty($coord['lat'] && !empty($coord['long']))) {
                        $new_location['gps_lat'] = $coord['lat'];
                        $new_location['gps_lng'] = $coord['long'];
                    }

                    if (!empty($item[$gps_key])) {
                        $new_location['gps_raw'] = $item[$gps_key];
                        if (empty($new_location['gps_lat'])) {
                            $new_location['parsed'] = false;
                            $not_parsed[] = $item[$gps_key];
                        }
                    }

                }

                if (!empty($item[2])) {
                    $new_quote = [
                        $item[2], $item[3], $item[4]
                    ];

                    $new_location['quotes'][] = $new_quote;
                }

                $locations[] = $new_location;
            }
            //  append location
            elseif ($k!=0) {
                $last_key = array_key_last($locations);

                if (!empty($item[2])) {

                    $new_quote = [
                        $item[2], $item[3], $item[4]
                    ];


                    $locations[$last_key]['quotes'][] = $new_quote;
                }

            }
        }

        return $locations;
    }

    private function create($model_id, $data)
    {
        foreach ($data as $k=>$v)
            if (!$v['quotes']) unset($data[$k]);
        $data=array_values($data);
        

        $no = 0;
        foreach ($data as $k=>$location) {

            foreach ($location['quotes'] as $k2=>$quote) {
                $location['quotes'][$k2] = [
                    $quote[0], $quote[2], $quote[1]
                ];
            }

            $location['collection'] = $model_id;
            $location['quotes'] = json_encode($location['quotes']);
            if (!empty($location['address'])) $location['active'] = 1;
            else $location['active'] = 0;

            $filters=['collection'=>$model_id,'label'=>$location['label']];

            $put_success = $this->parent->putJsonModel('map_locations',$location,$filters);
            if (!$put_success) {
                dd($this->parent->orm->getLastError());
            }

            $no++;
        }

        return $no;


    }

    private function create_old ($model_id,$data)
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

            // if ($r['label']=='Burger Barn') $r['gps']='45.55,-122.66';

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


    private function parseCoordinates($str) {
        $str = str_replace(["′", "″"], ["'", '"'], $str); // Replace uncommon single and double quote characters
        if(preg_match('/(\d{1,3})°(\d{1,2})\'(\d{1,2}(?:\.\d+)?)?"([NSEW])\s*(\d{1,3})°(\d{1,2})\'(\d{1,2}(?:\.\d+)?)?"([NSEW])/', $str, $matches)) {
            // DMS format
            $latitude  = ($matches[4] === 'N'? 1 : -1) * ($matches[1] + $matches[2] / 60 + ($matches[3] ?: 0) / 3600);
            $longitude = ($matches[8] === 'E'? 1 : -1) * ($matches[5] + $matches[6] / 60 + ($matches[7] ?: 0) / 3600);
        } elseif(preg_match('/(\-?\d+\.\d+)\°?\s*([NS]),?\s*(\-?\d+\.\d+)\°?\s*([EW])\s*/i', $str, $matches)) {
            // Decimal degrees with cardinal direction
            $latitude  = ($matches[2] === 'N' ? 1 : -1) * $matches[1];
            $longitude = ($matches[4] === 'E' ? 1 : -1) * $matches[3];
        } elseif(preg_match('/(\-?\d+\.\d+), (\-?\d+\.\d+)/', $str, $matches)){
            // Decimal format
            $latitude  = $matches[1];
            $longitude = $matches[2];
        } else {
            // If the coordinate cannot be parsed, return false
            return false;
        }

        return ['lat' => $latitude, 'long' => $longitude];
    }
}
