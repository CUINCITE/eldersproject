<?php

/**
 * This class expands and updates the content of articles used across various modules (events, scenarios etc.)
 */

class model_app_pages_search
{

    /**
     * Constructor
     * @param array $parent
     * @param array $settings
     * @return array updated article
     */

    function __construct($parent, $settings = null)
    {
        /**
         * Instance of model_app_pages class
         */
        $this->parent = $parent;

        /**
         * Property that is used to store optional configuration
         */
        $this->settings = $settings;
    }

    /**
     * Method search
     * @param string $text
     * @param array $media
     * @param string $lead
     * @return array updated article
     */
    public function get($q, $live = false, $page = 1)
    {
        $categories = [];
        if ($q) {

            $categories[] = $interviews = $this->getItems('narrators', $q, $live, $page);

            $collections_ids = [];
            if (!empty($interviews['items'])) {
                $collections_ids = array_reduce($interviews['items'], function ($carry, $item) {
                    if (!empty($item['interviewers'])) {
                        $ids = array_column($item['interviewers'], 'id');
                        return array_merge($carry, $ids);
                    }
                    return $carry;
                }, []);
            }

            $categories[] = $this->getItems('collections', $q, $live, $page,['collections'=>$collections_ids]);
            $categories[] = $this->getTranscripts($q, $live, $page, $f=[]);
        }

        /*
        remove empty sections
        */
        foreach ($categories as $k => $v)
            if (empty($v['items'])) unset($categories[$k]);

        return array_values($categories);
    }

    /**
     * Method getItems - searches for items in given section (category)
     * @param string $cat
     * @param string $query
     * @param boolean $live
     * @param integer $page
     */
    private function getItems($cat, $query, $live, $page = 1,$params=[])
    {
        
        if (is_array($query) && empty($query[$cat])) return [];
        else if (is_array($query)) $query = $query[$cat];


        if ($live) {
            $per_page = 3;
            $limit = '0,3';
        } else {
            $per_page = null;
            $limit = null;
        }

        if ($query) $qsafe = $this->parent->sqlSafe($query); else $qsafe='';
        if ($qsafe) $q_multi = explode(' ', $qsafe); else $q_multi=[];
        
        foreach ($q_multi as $k => $v) {
            $v = trim($v);
            if (strlen($v) < 2) unset($q_multi[$k]);
            else $q_multi[$k] = strtolower($v);
        }
        $q_multi = array_values($q_multi);
        $q_multi_query_one_field = '$label$ LIKE "%' . implode('%" && $label$ LIKE "%', $q_multi) . '%"';

        $f = [
            'active' => 1,
            'label' => ['operator' => '%LIKE%', 'value' => $query]
        ];
        $sort = 'label';
        $label = 'label';
        $fields_to_read=[];

        switch ($cat) {

            case "collections":
                $model = 'interviewers';
                // advanced
                if (is_array($query)) {
                    if (!empty($query['narrator'])) $f['name'] = ['operator' => '%LIKE%', 'value' => $query['narrator']];
                    if (!empty($query['interviewer']))  $f['interviewer_name'] = ['operator' => '%LIKE%', 'value' => $query['interviewer']];
                } else {
                    $f['name'] = [
                        'type' => 'custom',
                        'join' => '||',
                        'value' => [
                            str_replace('$label$', 'first_name', $q_multi_query_one_field),
                            str_replace('$label$', 'last_name', $q_multi_query_one_field),
                            'id IN ('.implode(',',$params['collections']).')'
                        ]
                    ];

                }
                $sort = $label = 'last_name';
                unset($f['label']);
                $fields_to_read=['first_name','last_name','slug'];
                break;

            case "narrators":
                $model = 'interviews';
                // advanced
                if (is_array($query)) {
                    if (!empty($query['narrator'])) $f['name'] = ['operator' => '%LIKE%', 'value' => $query['narrator']];
                    if (!empty($query['interviewer']))  $f['interviewer_name'] = ['operator' => '%LIKE%', 'value' => $query['interviewer']];
                } else {
                    $f['name'] = [
                        'type' => 'custom',
                        'join' => '||',
                        'value' => [
                            str_replace('$label$', 'label', $q_multi_query_one_field)
                        ]
                    ];

                }
                $sort = $label = 'label';
                unset($f['label']);
                $fields_to_read=['label','narrators_states','uid','occupation','summary','slug', 'interviewers', 'narrators'];

                break;

        }

        $params=[];
        if ($fields_to_read) $params['fields']=$fields_to_read;
        $items = $this->parent->getJsonModel($model, $f, false, $sort, $limit,$params);

        foreach ($items as $k => $v) {
            if (is_array($label)) {
                $s = [];
                foreach ($label as $kk => $vv)
                    $s[] = $v[$vv];
                $s = implode(' ', $s);
            } else $s = $v[$label];

        }
        
        if (!$live && (count($items) == $per_page))
        {
            $url_more = 'search?q=' . $query . '&page=' . ($page + 1) . '&partial=true&section=' . $cat;            
        }
        else $url_more = null;

        $label = $cat;
        if ($cat == 'narrators') $label = 'Interviews';

        return
            [
                'category' => $cat,
                'label' => $label,
                'items' => $items,
                'url_more' => $url_more
            ];
    }

    public function getTranscripts($q, $live, $page = 1, $interviews_ids = [], $per_page = 10,$max_per_session=3,$interviews_filters=[])
    {
        if ($live) {
            if (is_numeric($live)) $per_page=$live;
                else $per_page = 3;
            $limit = 'LIMIT 0,3';
        } else {
            $limit='';
        }

        if (!is_array($q)) $qsafe = [$q];
        else $qsafe = $q;

        foreach ($qsafe as $k => $v) $qsafe[$k] = $this->parent->sqlSafe($v);
        $interviews_ids = '';


        $qsafe_query = '(transcript LIKE "%' . implode('%" || transcript LIKE "%', $qsafe) . '%")';
        $query = 'SELECT id,parent,nr FROM sessions WHERE ' . $interviews_ids . ' ' . $qsafe_query . ' ORDER BY id,nr ' . $limit;

        $items = $this->parent->orm->query($query, false);

        // new count style
        $items_count = $this->parent->orm->query('SELECT id,transcript FROM sessions WHERE ' . $interviews_ids . ' ' . $qsafe_query);        
        $total_count=0;
        foreach ($items_count as $k=>$v)
        {
            $i=0;
            while (strpos(strtolower($v['transcript']),strtolower($q),$i))
            {
                $total_count++;
                $i=1+strpos(strtolower($v['transcript']),strtolower($q),$i);
            }
        }
        /*
        $total_count = $this->parent->orm->query('SELECT COUNT(*) AS ile FROM sessions WHERE ' . $interviews_filters . ' ' . $qsafe_query, true);        
        if ($total_count) $total_count = $total_count['ile'];
        else $total_count = count($items);*/


        $index = 0;
        $first = ($page - 1) * $per_page;
        $i_groups=0;
        $i_transcripts=0;
        $g=[];
        $t=[];
        $g_temp=[];
        
        
        foreach ($items as $k => $v)
            if (
                ($live && $i_transcripts < $per_page) || (!$live && $i_groups <= $page*$per_page)
                )
            {
                $tt=[];
                
                $i = $this->parent->getJsonModel('interviews', ['id' => $v['parent'],'active'=>1 ], true,null,null,['fields'=>['label','slug']]);
                $transcript_tags=$this->parent->query('SELECT transcript_tags FROM sessions WHERE id='.$v['id'],true);
                
                $f = $this->getFragments($transcript_tags['transcript_tags'], $q,$max_per_session);

                if ($i)
                foreach ($f as $kk => $vv) {
                    
                        if ( ($live && $i_transcripts < $per_page) || !$live)
                        {                            
                            if ($index >= $first || !$live)
                            {
                                
                                $i_transcripts++;
                                
                                $t[]=$tt[] =
                                    [
                                        'label' => $i['label'],
                                        "text" => $vv['text'],
                                        'path' => $i['url'],
                                        'url' => ['type' => 'interview', 'slug' => $i['slug'], 'time' => $vv['timestamp'],'session'=>$v['nr']]
                                    ];
                            }

                            if ($live) $index++;
                            else
                            {   
                                
                                
                            }

                        }
                    
                    
                }

                if (!$live && $tt)
                {
                    if (empty($g[$v['parent']])) 
                    {
                        $g[$v['parent']]=['id'=>$v['parent'],'label'=>$i['label'],'items'=>[]];
                        $i_groups++;
                    }
                    $g[$v['parent']]['items']=array_merge($g[$v['parent']]['items'],$tt);
                }
            }

        if (!$live) $t=array_slice($g,($page-1)*$per_page,$per_page);
        

        if (!$live && count($t) == $per_page)
        {
            
            $url_more = 'search?q=' . $q . '&page=' . ($page + 1) . '&partial=true&section=transcripts';
            if (!empty($interviews_filters['narrators_categories']))
            {
                $f=[];
                $c=$this->parent->dictGet('narrators_categories');
                foreach ($interviews_filters['narrators_categories'] as $k=>$v)
                    $f[]=_uho_fx::array_filter($c,'id',$v,['first'=>true])['slug'];
                if ($f) $url_more.='&narrator='.implode(',',$f);
            }
            if (!empty($interviews_filters['topics']))
            {
                $f=[];
                $c=$this->parent->dictGet('topics');
                foreach ($interviews_filters['topics'] as $k=>$v)
                    $f[]=_uho_fx::array_filter($c,'id',$v,['first'=>true])['slug'];
                if ($f) $url_more.='&topic='.implode(',',$f);
            }            
            
        }
        else $url_more = null;

        $item = [
            'label'=>'Transcripts',
            'category' => 'transcripts',
            'items' => $t,
            'total_count' => $total_count,
            'url_more' => $url_more
        ];

        return $item;
    }

    private function getFragments($text, $q, $max = 3)
    {
        $text = strip_tags($text, '<q><a>');

        if (!is_array($q)) $qq = [$q];
        else $qq = $q;
        $items = [];

        foreach ($qq as $kk => $q) {
            $i = 0;

            $margin = intval((80 - $this->strlen($q)) / 2);

            while ($max && $this->stripos(' ' . $text, $q, $i)) {
                $max--;
                $i = $i1 = $this->stripos($text, $q, $i);
                $timestamp = $this->parent->getTimestamp($text, $i);
                
                $i2 = $i1 - $margin;
                if ($i2 < 0) $i2 - 0;

                $val = $this->substr($text, $i2, $margin * 2 + $this->strlen($q));

                $i2 = $this->strpos($val, ' ');
                if ($i2 >= 0) $val = $this->substr($val, $i2 + 1);
                $i2 = $this->strrpos($val, ' ');
                $val = $this->substr($val, 0, $i2);

                $i1 = $this->stripos($val, $q);
                
                $pre=$this->substr($val, 0, $i1);
                if (strpos($pre,'>')) $pre=$this->substr($pre,1+$this->strpos($pre,'>'));
                $past=$this->substr($val, $i1 + $this->strlen($q));
                if (strpos($past,'<')) $past=$this->substr($past,0,$this->strpos($past,'<'));

                $val = $pre . '<span>' . $this->substr($val, $i1, $this->strlen($q)) . '</span>' . $past;

                if ($val) $items[] = ['text' => '...' . $val . '...', 'timestamp' => $timestamp];
                $i += $this->strlen($q);
            }
        }

        return $items;
    }

    private function cut(&$text, $tags)
    {

        $i = -1;
        foreach ($tags as $k => $v) {
            $j = mb_strpos($text, '<' . $v);
            if ($j !== false && ($i == -1 || $j < $i)) {
                $i = $j;
                $tag = $v;
            }
        }

        if ($i != -1) {
            $j = mb_strpos($text, '</' . $tag, $i);
            if (!$j) $j = mb_strlen($text, 'UTF-8');

            $k = mb_strpos($text, '>', $i);
            $t = mb_substr($text, $i + 1, $k - $i - 1);

            $t = explode(' ', $t);
            $new_tag = array_shift($t);
            $t = implode(' ', $t);
            $t = explode('" ', $t);
            $params = [];


            foreach ($t as $kk => $vv)
                if (mb_strpos($vv, '=')) {
                    $vv = explode('=', $vv);
                    $params[array_shift($vv)] = str_replace('"', '', implode('=', $vv));
                } else $params[] = $vv;

            $result = [
                'tag' => $new_tag,
                'params' => $params,
                'text' => mb_substr($text, $k + 1, $j - $k - mb_strlen($tag, 'UTF-8'))
            ];
            if (!json_encode($result['text'])) {
                exit($result['text']);
            }
            $text = trim(mb_substr($text, $j + mb_strlen($tag, 'UTF-8') + 3));
        } else {
            $text = '';
            $result = [];
        }
        if (!json_encode($result)) exit('error at: ' . $result['text']);
        
        return $result;
    }

    private function strlen($s) { return mb_strlen($s,'UTF-8');}
    private function strpos($s,$i1,$i2=0) { return mb_strpos($s,$i1,$i2,'UTF-8');}
    private function stripos($s,$i1,$i2=0) { return mb_stripos($s,$i1,$i2,'UTF-8');}
    private function strrpos($s,$i1,$i2=0) { return mb_strrpos($s,$i1,$i2,'UTF-8');}
    private function substr($s,$i1,$i2=null) { return mb_substr($s,$i1,$i2,'UTF-8');}

    private function getTranscriptMentions($time_index,$text,$type,$tag,$label)
    {
		
        $text=str_replace('  ',' ',$text);
        $text=str_replace(' ,',',',$text);
        $items=[];
        $tag='<'.$type.'::'.$tag.'>';
        
        $max=100;
        $i=0;
        $len=40;
        $text=str_replace('</Organization>','',$text);

        while ($max && $this->strpos(' '.$text,$tag,$i))
        {
            $max--;
            $i1=$this->strpos($text,$tag,$i);
            $i2=$this->strpos($text,'>',$i1);

            $txt1=trim(strip_tags($this->substr($text,0,$i1)));
            
            $txt1=$this->substr($txt1,$this->strlen($txt1)-$len,$len);
            $i3=$this->strpos($txt1,' ');
            $txt1=$this->substr($txt1,$i3+1);	
			
			$i3=$this->strpos($text,'<',$i2);
			$copy=$this->substr($text,$i2+1,$i3-$i2-1);

            $txt2=trim(strip_tags($this->substr($text,$i2+1+$this->strlen($copy) )));
            
            $txt2=$this->substr($txt2,0,$len);
            $i3=$this->strrpos($txt2,' ');
            $txt2=$this->substr($txt2,0,$i3-1);
            
            $item=[
				'text'=>'...'.$txt1.' <span>'.$copy.'</span> '.$txt2.'...',
				'timestamp'=>$time_index+$this->parent->getTimestamp($text,$i1,$tag)+1 // +1 so we are sure it goes to proper transcirption
			];

            

            $items[]=$item;
            
            
            $i=$i2;
        }
		
        return $items;
    }

    public function getTranscriptsFromInterview($item,$label)
    {        
        $interview=$this->parent->getJsonModel('interviews',['id'=>$item['interview']],true);
        $sessions=$this->parent->getJsonModel('sessions_transcript',['parent'=>$item['interview']],false,'nr');
        $template=[
            'label'=>$interview['name'],
            'url'=>$interview['url'],
        ];
        $items=[];
		$time_index=0;

        
        
        foreach ($sessions as $k=>$v)
        {
			
            $i=$this->getTranscriptMentions($time_index,$v['transcript_tags'],$item['index_type'],$item['index_id'],$label);

            foreach ($i as $kk=>$vv)
            {
                $ii=$template;
				$ii['url']['time']=$vv['timestamp'];
                $ii['text']=$vv['text'];
                $items[]=$ii;
            }

			$time_index+=$v['duration'];
        }
        
        return $items;
    }

    public function transcriptsPager($t,$page,$per_page)
	{
        $total=count($t);
        // group by interview
        $g=[];
        foreach ($t as $k=>$v)
        {
            if (empty($g[$v['label']]))  $g[$v['label']]=['label'=>$v['label'],'items'=>[]];
            $g[$v['label']]['items'][]=$v;
        }

        $r=[];
        $r['total_count']=$total;
        $r['items']=$g=array_slice($g,($page-1)*$per_page,$per_page);
            if (count($g)==$per_page)
                    $r['url_more']=['type'=>'url_now','get'=>['page'=>$page+1]];
        
        
		/*	$r=[];
            $r['total_count']=count($t);
            $r['items']=$t=array_slice($t,($page-1)*$per_page,$per_page);
            if (count($t)==$per_page)
                    $r['url_more']=['type'=>'url_now','get'=>['page'=>$page+1]];*/
			return $r;
	}

    /*
    Search Transcripts by Index OLD
    
    public function searchTranscriptsByIndex($index_type, $index_id,$index_label,$page,$per_page)
    {
        // get all indexes
        $items = $this->parent->getJsonModel('interviews_indexes', ['index_type' => $index_type, 'index_id' => $index_id]);

        // get all transcripts, get interviews by the way
        $interviews = [];
        $t = [];
        foreach ($items as $k => $v)
        {
            if (!isset($interviews[$v['interview']])) $interviews[$v['interview']]=[$v['interview'],0];
            $interviews[$v['interview']][1]++;
            $t = array_merge($t, $this->getTranscriptsFromInterview($v, $index_label));
        }
        $interviews=_uho_fx::array_multisort($interviews,SORT_DESC);
        $interviews=_uho_fx::array_extract($interviews,0);

        return ([
                'transcripts' => $this->transcriptsPager($t,$page,$per_page),
                'interviews' => $interviews
            ]
        );
    }*/
    /*
    Search Transcripts by Index OLD
    */
    public function searchTranscriptsByIndex($index_type, $index_id,$index_label,$page,$per_page)
    {
        // get all indexes
        $items = $this->parent->getJsonModel('interviews_indexes', ['index_type' => $index_type, 'index_id' => $index_id]);

        // get all transcripts, get interviews by the way
        $interviews = [];
        $t = [];
        foreach ($items as $k => $v)
        {
            if (!isset($interviews[$v['interview']])) $interviews[$v['interview']]=[$v['interview'],0];
            $interviews[$v['interview']][1]++;
            $t = array_merge($t, $this->getTranscriptsFromInterview($v, $index_label));
        }
        $interviews=_uho_fx::array_multisort($interviews,SORT_DESC);
        $interviews=_uho_fx::array_extract($interviews,0);

        return ([
                'transcripts' => $this->transcriptsPager($t,$page,$per_page),
                'interviews' => $interviews
            ]
        );
    }

}
