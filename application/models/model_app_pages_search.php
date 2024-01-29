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
    public function get($q, $live = false, $page = 1, $transcripts_only=false)
    {
        $categories = [];
        if ($q) {

            if (!$transcripts_only) {
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
            }
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
                            str_replace('$label$', 'last_name', $q_multi_query_one_field)
                        ]
                    ];

                }

                if ($params['collections']) {
                    $f['name']['value'][] = 'id IN ('.implode(',',$params['collections']).')';
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
        

        $items_loaded_so_far = ($page - 1) * $per_page + $i_transcripts;
        $more_items = $items_loaded_so_far < $total_count;

        if (!$live && $more_items)
        {
            $url_more = 'search?q=' . $q . '&page=' . ($page + 1) . '&section=transcripts';
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

    private function strlen($s) { return mb_strlen($s,'UTF-8');}
    private function strpos($s,$i1,$i2=0) { return mb_strpos($s,$i1,$i2,'UTF-8');}
    private function stripos($s,$i1,$i2=0) { return mb_stripos($s,$i1,$i2,'UTF-8');}
    private function strrpos($s,$i1,$i2=0) { return mb_strrpos($s,$i1,$i2,'UTF-8');}
    private function substr($s,$i1,$i2=null) { return mb_substr($s,$i1,$i2,'UTF-8');}

}
