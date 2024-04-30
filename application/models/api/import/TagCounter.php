<?php

class TagCounter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        // states
        $states = $this->parent->getJsonModel('s_states');

        $stateCount = 0;

        foreach ($states as $k=>$v) {
            $stateCount = $this->parent->getJsonModel('interviews', ['narrators_states' => $v['id'], 'active' => 1], false, null, null, ['count' => true]);

            $r = $this->parent->putJsonModel('s_states', ['count_interviews' => $stateCount], ['id' => $v['id']]);

            if (!$r) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }

            $stateCount++;
        }

        // tags
        $topics = $this->parent->getJsonModel('topics');

        $topicCount = 0;

        foreach ($topics as $topic) {
            $activeInterviewCount = $this->parent->query("SELECT id FROM interviews WHERE topics LIKE '%". _uho_fx::dozeruj($topic['id'], 8)."%';");;
            $activeInterviewCount = count($activeInterviewCount);

            $updateResult = $this->parent->putJsonModel('topics', ['count_interviews' => $activeInterviewCount], ['id' => $topic['id']]);

            if (!$updateResult) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }

            $topicCount++;
        }

        return ['result' => true, 'Counted topics' => $topicCount, 'Counted states' => $stateCount ];
    }
}
