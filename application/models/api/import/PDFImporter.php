<?php

use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIOFactory;
class PDFImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {

        require (__DIR__ . '/../../../library/vendor/autoload.php');

        // get files
        $dir = $_SERVER['DOCUMENT_ROOT'] . '/_data/_transcripts';
        $dest_dir = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/interviews/transcripts';
        $xls = $_SERVER['DOCUMENT_ROOT'] . '/_data/Elder Project PDF Key.xlsx';

        $spreadsheet = ExcelIOFactory::load($xls);
        $sheet = $spreadsheet->getSheet(0)->toArray();
        $sheet = _uho_fx::convertSpreadsheet($sheet);
        $interviews=$this->parent->getJsonModel('interviews_simple');

        $langs=[
            ['ENG','EN'],
            ['SP','ES']
        ];

        $count=['EN'=>0,'ES'=>0];
        $errors=[];

        foreach ($sheet as $k=>$v)        
        {
            $interview=_uho_fx::array_filter($interviews,'incite_id',$v['Interview ID'],['first'=>true,'strict'=>true]);
            if (!$interview) return['result'=>false,'message'=>'Interview not found: '.$v['Interview ID']];
            $val=[];
            foreach ($langs as $kk=>$vv)
            {                
                $source=@$v['Transcript ('.$vv[0].')'];
                if ($source && $source!='#VALUE!_web.pdf')
                {
                    $source=$dir.'/'.$source;
                    $dest=$dest_dir.'/'.$interview['uid'].'_'.$vv[1].'.pdf';
                    $size=@filesize($source);
                    if (!$size) $errors[]='File not found: '.$source;
                    else
                    {
                        copy($source,$dest);                
                        $val['pdf_'.strtolower($vv[1]).'_size']=$size;
                        $count[$vv[1]]++;
                    }
                }
            }

            if ($val)
            $this->parent->putJsonModel('interviews',$val,['id'=>$interview['id']]);


        }

        $this->parent->sql->queryOut('UPDATE interviews SET status_transcripts=0 WHERE pdf_en_size=0');
        $this->parent->sql->queryOut('UPDATE interviews SET status_transcripts=1 WHERE pdf_en_size!=0');

        return ['result' => true, 'count'=>$count,'errors'=>$errors];
    }
}
