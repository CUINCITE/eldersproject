<?php

use PhpOffice\PhpWord\Element\AbstractContainer;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;

class model_app_api_session_import
{
	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{        
        $this->parent->cache_kill();
        $session=@_uho_fx::getGet('session');
        if (!$session && isset($params['session'])) $session = $params['session'];

        if (!$session) return['result'=>false,'message'=>'No session defined'];
		
		$session=$this->parent->getJsonModel('sessions',['id'=>intval($session)],true);
		
		if (!$session) return['result'=>false,'message'=>'No session found'];
		if (empty($session['doc']['src'])) return['result'=>false,'message'=>'No DOCX found in this session'];

		$docx=explode('?',$session['doc']['src'])[0];
		$temp=$_SERVER['DOCUMENT_ROOT'].'/serdelia/temp/temp.docx';
		copy($docx,$temp);
		$docx=$temp;
//		$docx=str_replace('https://elder-stage-bucket.s3.amazonaws.com',$_SERVER['DOCUMENT_ROOT'].'/public/upload',$docx);

		require(__DIR__ . '/../../library/vendor/autoload.php');

		try {
			$objReader = WordIOFactory::createReader('Word2007');
			$phpWord = $objReader->load($docx);//$_SERVER['DOCUMENT_ROOT'].'/'.$docx);
		} catch (Exception $e) {
			return['result'=>false,'message'=>'objReader Error loading: ' . $docx];
		}

		$narrators=[];
		foreach ($session['parent']['narrators'] as $k=>$v)
			$narrators[]=$v['surname'];

		$iLines=0;
		$source=''; $tag=''; $time='';

		foreach ($narrators as $k=>$v)
		{
			$narrators[$k]=str_replace('Turner-Addison','Addison',$v);
		}
		

		foreach ($phpWord->getSections() as $section) {
			foreach ($section->getElements() as $element)
			{
				$line=$this->getWordText($element);
				if (1==2)
				{
					echo($line.chr(13).chr(10));
				} else
				{
					$r=$this->getConvertLineTags($line,$narrators,$tag,$time);
					if ($r)
					{
						$tag=$r['tag'];
						$time=$r['time'];
						$source .= $r['text']. chr(13) . chr(10);
					}
					$iLines++;
				}				
			}
		}

		$r = $this->parent->putJsonModel('sessions',['status_transcript'=>1,'transcript'=>strip_tags($source),'transcript_tags'=>$source],['id'=>$session['id']]);
        if (!$r) return ['result' => false, 'message' => $this->parent->orm->getLastError()];
		//exit(nl2br($source));
		return ['result'=>true,'message'=>'Sessions converted to '.$iLines.' lines.'];

	}

	private function getWordText($element)
    {
        $result = '';
        if ($element instanceof AbstractContainer) {
            foreach ($element->getElements() as $element) {
                $result .= $this->getWordText($element);
            }
        } elseif ($element instanceof Text) {
            $result .= $element->getText();
        }
        // and so on for other element types (see src/PhpWord/Element)

        return $result;
    }

	private function getConvertLineTags($txt,$narrators=[],$tag='Q',$time_last='')
	{
		//echo($txt.'
		//');

		$txt=str_replace('ñ','ñ',$txt);	//Tufiño
		if ($narrators[0]=='Pérez') $narrators[0]='D’Alerta'; // D’Alerta
		
		
		if (!$tag) $tag='Q';
		if (@$txt[0]!='[')
		{
			
			$i1=mb_strpos($txt,'[',0,'UTF-8');
			$i2=mb_strpos($txt,']',$i1,'UTF-8');
			if ($i1 && $i2>$i1 && $i2-$i1==9)
			{				
				$t=mb_substr($txt,$i1+1,8,'UTF-8');
				$txt='['.$t.'] '.mb_substr($txt,0,$i1,'UTF-8').mb_substr($txt,$i2+1,NULL,'UTF-8');
				
			} else
			{
				if (!$txt || !$time_last) return false;
				$txt='['.$time_last.'] '.$txt;				
			}
			$txt=str_replace('  ',' ',$txt);				
			
		}

		// THAT'S WRONG - WILL CONVERT ALL NAMES, ALSO THESE INSIDE THE SENTENCE!
		//if (count($narrators)==1) $txt=str_replace($narrators[0],'A',$txt);
				
		$time=mb_substr($txt,1,8,'UTF-8');
		if ($time[2]==':' && $time[5]==':'); else $time=$time_last;				
		$text=substr($txt,11);
		
		
		if (substr($text,0,3)=='Q: ')
		{
			$tag='Q';
			$text=substr($text,3);
		} else
		if (substr($text,0,3)=='A: ')
		{
			$tag='A';
			$text=substr($text,3);
		} else
		{	
			foreach ($narrators as $k=>$v)
			{
				if (mb_substr($text,0,mb_strlen($v,'UTF-8'),'UTF-8')==$v)
				{
					$tag='A';
					if (count($narrators)==1) $text=mb_substr($text,mb_strlen($v,'UTF-8')+2,null,'UTF-8');
					break;
				} else
				{
					//echo(' [['.mb_substr($text,0,mb_strlen($v,'UTF-8'),'UTF-8').' :: '.$v.' ]] ');
				}
			}
		}

		$txt='<'.$tag.' T="'.$time.'">'.$text;
		
		$r=['text'=>$txt,'tag'=>$tag,'time'=>$time];
		return $r;
	}

}
