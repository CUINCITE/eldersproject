<?php

/**
 * Download proxy method
 */

class model_app_api_import
{


	function __construct($parent, $settings)
	{
		$this->parent = $parent;
		$this->settings = $settings;
	}

	public function rest($method, $params)
	{
        //$action='interviews';
        //$action='narrators';
        //$action='sessions';
        $action='states_allocate';

        switch ($action)
        {
            case "states_allocate":
                $states=$this->parent->getJsonModel('s_states');
                $sessions=$this->parent->query('SELECT id,narrator_location FROM sessions WHERE narrator_location!=""');
                foreach ($sessions as $k=>$v)
                {
                    $vv=explode(',',$v['narrator_location']);
                    $state=trim(array_pop($vv));
                    if ($state && strlen($state)==2)
                    {
                        $i=_uho_fx::array_filter($states,'slug',$state,['first'=>true]);
                        if ($i)
                        {
                            $r=$this->parent->putJsonModel('sessions',['narrator_state'=>$i['id']],['id'=>$v['id']]);
                            if (!$r) exit('error');
                        } else echo('not found='.$vv[1].' ');
                    }
                }                
                exit('!');

                break;
            case "states_add":
                $s=[];$ss=[];
                $states=$this->parent->query('SELECT id,narrator_location FROM sessions WHERE narrator_location!=""');
                foreach ($states as $k=>$v)
                {
                    $v=explode(';',$v['narrator_location']);
                    foreach ($v as $kk=>$vv)
                    {
                        $vv=trim($vv);
                        if ($vv)
                        {
                            $ss[$vv]=1;
                            $vv=explode(',',$vv);
                        }
                        $vv=@trim($vv[1]);
                        if (strlen($vv)==2) $s[$vv]=1;
                    }                    
                }
                
                $this->parent->queryOut('TRUNCATE TABLE s_states');
                foreach ($s as $k=>$v)
                    $this->parent->postJsonModel('s_states',['slug'=>$k,'active'=>1]);
                break;
            case "narrators":
            
            $items=_uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'].'/_data/csv/interviews.csv',';');
            $n=[];
            
            foreach ($items as $k=>$v)
            {
                if (@$v['1st Narrator: Full Name']) $n[$v['1st Narrator: Full Name']]=$v['Brief Narrator Bio'];
                if (@$v['2nd Narrator: Full Name']) $n[$v['2nd Narrator: Full Name']]=$v['Brief Narrator Bio'];
                if (@$v['3rd Narrator: Full Name']) $n[$v['3rd Narrator: Full Name']]=$v['Brief Narrator Bio'];
            }
            
            $this->parent->queryOut('TRUNCATE TABLE narrators');
            
            foreach ($n as $k=>$v)
            {
                $vv=explode(' ',$k);                
                $last_name=array_pop($vv);
                $first_name=implode(' ',$vv);
                $this->parent->postJsonModel('narrators',['active'=>1,'name'=>$first_name,'surname'=>$last_name,'bio'=>$v]);
            }

            return['count'=>count($n)];
            
            
            break;

            case "interviews":

                $narrators=$this->parent->getJsonModel('narrators');
                foreach ($narrators as $k=>$v) $narrators[$k]=['id'=>$v['id'],'name'=>$v['name'].' '.$v['surname']];
                $interviewers=$this->parent->getJsonModel('interviewers');
                foreach ($interviewers as $k=>$v) $interviewers[$k]=['id'=>$v['id'],'name'=>$v['first_name'].' '.$v['last_name']];

                $items=_uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'].'/_data/csv/interviews.csv',';');
                
                
                foreach ($items as $k=>$v)
                {
                    $n=[];
                    if (@$v['1st Narrator: Full Name']) $n[]=$v['1st Narrator: Full Name'];
                    if (@$v['2nd Narrator: Full Name']) $n[]=$v['2nd Narrator: Full Name'];
                    if (@$v['3rd Narrator: Full Name']) $n[]=$v['3rd Narrator: Full Name'];
                    $name=implode(', ',$n);
                    foreach ($n as $kk=>$vv)
                    {
                        $id=_uho_fx::array_filter($narrators,'name',$vv,['first'=>true]);
                        if (!$id) exit('narrator not found='.$vv);
                        $n[$kk]=$id['id'];
                    }
                    $i=[];
                    if (@$v['Interviewer: Full Name'])  $i[]=$v['Interviewer: Full Name'];
                    if (@$v['2nd Interviewer: Full Name']) $i[]=$v['2nd Interviewer: Full Name'];
                    if (@$v['3rd Interviewer: Full Name']) $i[]=$v['3rd Interviewer: Full Name'];
                    foreach ($i as $kk=>$vv)
                    {
                        $id=_uho_fx::array_filter($interviewers,'name',$vv,['first'=>true]);
                        if (!$id) exit('narrator not found='.$vv);
                        $i[$kk]=$id['id'];
                    }

                    $items[$k]=[
                        'narrators'=>$n,
                        'name'=>$name,
                        'interviewers'=>$i,
                        'summary'=>$v['Brief Interview Summary'],
                        'active'=>1
                    ];
                    
                    
                }

                $this->parent->queryOut('TRUNCATE TABLE interviews');
                foreach ($items as $k=>$v)
                {
                    $r=$this->parent->postJsonModel('interviews',$v);
                    if (!$r) exit($this->parent->orm->getLastError());
                }
                return['count'=>count($items)];

                break;

                case "sessions":

                    $interviews=$this->parent->getJsonModel('interviews');
                    foreach ($interviews as $k=>$v)
                        $interviews[$k]=['id'=>$v['id'],'name'=>$v['narrators'][0]['name'].' '.$v['narrators'][0]['surname']];
                    
                    $items=_uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'].'/_data/csv/sessions.csv',',');
                    foreach ($items as $k=>$v)
                    {
                        $date=explode('/',$v['Session Date']);
                        if (count($date)==3) $date=$date[2].'-'._uho_fx::dozeruj($date[0],2).'-'._uho_fx::dozeruj($date[1],2);
                            else $date='';
                        $languages=$v['Language of Interview'];
                        $languages=str_replace(';',',',$languages);
                        $languages=str_replace(' and ',', ',$languages);

                        if (!$languages || $languages=='English') $languages=[1];
                            elseif ($languages=='Spanish') $languages=[2];
                            elseif ($languages=='English, Spanish') $languages=[1,2];
                            else exit($languages.'!');
                        
                        $duration=trim($v['Media File Duration']);
                        if ($duration) $duration=explode(':',$duration);
                        if ($duration && count($duration)==3)
                        {
                            $duration=$duration[0]*60*60+$duration[1]*60+$duration[2];
                        }
                        elseif ($duration && count($duration)==2)
                        {
                            $duration=$duration[0]*60+$duration[1];
                        }
                        elseif ($duration)
                        {
                            print_r($duration);exit();
                        }

                        $interview=$v['1st Narrator: Full Name'];
                        $interview_id=_uho_fx::array_filter($interviews,'name',$interview,['first'=>true]);
                        if (!$interview_id) exit('interview not found='.$interview);
                        else $interview_id=$interview_id['id'];

                        $items[$k]=[
                            'nr'=>intval(substr($v['Session Name'],8)),
                            'parent'=>$interview_id,
                            'acitve'=>1,
                            'media'=>'audio',
                            'date'=>$date,
                            'narrator_location'=>$v['Session Location(s)'],
                            'interviewer_location'=>$v['Session Location(s)'],
                            'languages'=>$languages,
                            'duration'=>$duration,
                            'filename'=>$v['Media File Name(s)']
                        ];
                    }
                    
                    $this->parent->queryOut('TRUNCATE TABLE sessions');
                    foreach ($items as $k=>$v)
                    {
                        $r=$this->parent->postJsonModel('sessions',$v);
                        if (!$r) exit($this->parent->orm->getLastError());
                    }

                    break;

        }


	}

	// --------------------------------------------------------------------------------

}
