<?php

class StatesImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        $this->parent->queryOut('TRUNCATE TABLE topics');
        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/interviews.csv', ',');

        $topics = [];

        foreach ($items as $k=>$interview) {
            $interviewTopics = $interview['Topic(s)'];
            $interviewTopics = explode(',', $interviewTopics);
            foreach ($interviewTopics as $topic) {
                $topic = trim($topic);
                if (!in_array($topic, $topics)) $topics[] = $topic;
            }
        }

        foreach ($topics as $k=>$v) {
            if ($v) {
                $item = [
                    'label' => $v,
                    'slug' => $this->slugify($v),
                    'active' => 1
                ];
                $topics[$k] = $item;
            } else unset($topics[$k]);
        }

        $count = 0;

        foreach ($topics as $k => $values) {
            $this->parent->postJsonModel('topics', $values);
            $count++;
        }

        $topics = $this->parent->getJsonModel('topics');

        foreach ($topics as $topic) {
            $activeInterviewCount = $this->parent->query("SELECT id FROM interviews WHERE topics LIKE '%". _uho_fx::dozeruj($topic['id'], 8)."%';");;
            $activeInterviewCount = count($activeInterviewCount);

            $updateResult = $this->parent->putJsonModel('topics', ['count_interviews' => $activeInterviewCount], ['id' => $topic['id']]);

            if (!$updateResult) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }
        }

        return ['result' => true, 'message' => "Added topics: $count"];
    }
}
