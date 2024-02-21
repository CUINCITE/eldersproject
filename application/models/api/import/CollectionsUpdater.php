<?php

class CollectionsUpdater extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {

        $collections = $this->parent->getJsonModel('interviewers');
        $count = 0;

        foreach ($collections as $collection) {
            $activeInterviewCount = $this->parent->query("SELECT id FROM interviews WHERE interviewers LIKE '%". _uho_fx::dozeruj($collection['id'], 8)."%';");;
            $activeInterviewCount = count($activeInterviewCount);

            $updateResult = $this->parent->putJsonModel('interviewers', ['amount' => $activeInterviewCount], ['id' => $collection['id']]);

            if (!$updateResult) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }

            $count++;
        }

        return ['result' => true, 'message' => "Updated Collections: $count"];
    }
}
