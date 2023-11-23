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
        if (!$session) return['result'=>false,'message'=>'No session defined'];
		
		$session=$this->parent->getJsonModel('sessions',['id'=>intval($session)],true);
		
		if (!$session) return['result'=>false,'message'=>'No session found'];
		if (empty($session['doc']['src'])) return['result'=>false,'message'=>'No DOCX found in this session'];

		$docx=explode('?',$session['doc']['src'])[0];

		require(__DIR__ . '/../../library/vendor/autoload.php');

		try {
			$objReader = WordIOFactory::createReader('Word2007');
			$phpWord = $objReader->load($_SERVER['DOCUMENT_ROOT'].'/'.$docx);
		} catch (Exception $e) {
			return['result'=>false,'message'=>'Error loading: ' . $docx];
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

		$this->parent->putJsonModel('sessions',['transcript'=>strip_tags($source),'transcript_tags'=>$source],['id'=>$session['id']]);
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
		
		if (!$tag) $tag='Q';
		if (@$txt[0]!='[')
		{
			
			$i1=strpos($txt,'[');
			$i2=strpos($txt,']',$i1);
			if ($i1 && $i2>$i1 && $i2-$i1==9)
			{				
				$t=substr($txt,$i1+1,8);
				$txt='['.$t.'] '.substr($txt,0,$i1).substr($txt,$i2+1);
				
			} else
			{
				if (!$txt || !$time_last) return false;
				$txt='['.$time_last.'] '.$txt;				
			}
			$txt=str_replace('  ',' ',$txt);				
			
		}
		if (count($narrators)==1) $txt=str_replace($narrators[0],'A',$txt);
				
		$time=substr($txt,1,8);
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
			if (substr($text,0,strlen($v))==$v)
			{
				$tag='A';
				if (count($narrators)==1) $text=substr($text,strlen($v)+2);
				break;
			}

		}

		$txt='<'.$tag.' T="'.$time.'">'.$text;
		
		$r=['text'=>$txt,'tag'=>$tag,'time'=>$time];
		return $r;
	}

}
