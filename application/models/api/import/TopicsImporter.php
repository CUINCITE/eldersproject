<?php

class TopicsImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        
        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/interviews.csv', ',');
        $this->parent->queryOut('UPDATE topics SET active=1');
        // check for new topics
        $topics=[];
        foreach ($items as $k=>$interview)
        {
            $interviewTopics = $interview['Topic(s)'];
            $interviewTopics = explode(';', $interviewTopics);
            foreach ($interviewTopics as $topic)
            {
                $topic = trim($topic);
                if (!in_array($topic, $topics)) $topics[] = $topic;
            }
        }

        $disabled=0;
        $new=0;

        $existing_topics = $this->parent->getJsonModel('topics');
        foreach ($existing_topics as $k=>$v)
            if (!in_array($v['label'],$topics))
            {
                $disabled++;
                $this->parent->putJsonModel('topics',['active'=>0],['id'=>$v['id']]);
            }
            
        foreach ($topics as $k=>$v)
        if ($v && !_uho_fx::array_filter($existing_topics,'label',$v))
        {
                $item = [
                    'label' => $v,
                    'slug' => $this->slugify($v),
                    'active' => 1
                ];
                $this->parent->postJsonModel('topics', $item);
                $new++;
        }


        $topics = $this->parent->getJsonModel('topics',['active'=>1]);

        // update interviews with new topics
        foreach ($items as $k=>$interview)
        {
            $interviewTopics = $interview['Topic(s)'];
            $interviewTopics = explode(';', $interviewTopics);
            foreach ($interviewTopics as $kk=>$topic)
            {
                $f=_uho_fx::array_filter($topics,'label',trim($topic),['first'=>true]);
                if (!$f) exit('topic not found: '.$topic);
                $interviewTopics[$kk]=$f['id'];
            }
            $this->parent->putJsonModel('interviews',['topics'=>$interviewTopics],['incite_id'=>$interview['Interview ID']]);
        }

        // set interviews count
        foreach ($topics as $topic)
        {
            $activeInterviewCount = $this->parent->query("SELECT id FROM interviews WHERE active=1 && topics LIKE '%". _uho_fx::dozeruj($topic['id'], 8)."%';");;
            $activeInterviewCount = count($activeInterviewCount);
            $f=['count_interviews' => $activeInterviewCount,'active'=>intval($activeInterviewCount>1)];
            
            $updateResult = $this->parent->putJsonModel('topics', $f, ['id' => $topic['id']]);

            if (!$updateResult) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }
        }

        return ['result' => true, 'disabled'=>$disabled,'new'=>$new,'message' => "Updated interviews: ".count($items)];
    }
}
