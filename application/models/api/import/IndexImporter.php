<?php

class IndexImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        set_time_limit(60);

        $this->parent->queryOut('TRUNCATE TABLE interview_indexes');
        $interviews = $this->parent->getJsonModel('interviews');
        $sessions = $this->parent->getJsonModel('sessions');

        $indexes = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/indexes.csv', ',');

        $count = 0;
        $interviewsNotFound = [];
        $sessionsNotFound = [];

        foreach ($indexes as $index) {
            $parentInterview = _uho_fx::array_filter($interviews, 'incite_id', $index['Interview ID'], ['first' => true]);
            if (!$parentInterview) {
                $interviewsNotFound[] = $index['Interview ID'];
                continue;
            }

            $parentSession = _uho_fx::array_filter($sessions, 'incite_id', $index['Session ID'], ['first' => true]);
            if (!$parentSession) {
                $sessionsNotFound[] = $index['Session ID'];
                continue;
            }

            $item = [
                'interview' => $parentInterview['id'],
                'session' => $parentSession['id'],
                'interview_incite_id' => $index['Interview ID'],
                'session_incite_id' => $index['Session ID'],
                'start_time' => $index['Start time'],
                'label' => $index['Label'],
                'no' => $index['Index']
            ];

            $post = $this->parent->postJsonModel('interview_indexes', $item);
            $count++;

        }
        return ['result' => true, 'message' => "Indexes added: " .$count, 'Interviews not found' => $interviewsNotFound, 'Sessions not found' => $sessionsNotFound];
    }
}
