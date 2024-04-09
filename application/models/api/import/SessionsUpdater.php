<?php

class SessionsUpdater extends model_app_api_import
{
    protected $parent; // Declare instance variable
    protected $settings; // Declare instance variable

    public function __construct($parent, $settings)
    {
        $this->parent = $parent;   // Assign values to instance variable
        $this->settings = $settings; // Assign values to instance variable
    }

    public function import()
    {
        set_time_limit(180);
        $sessions = $this->parent->query('SELECT id FROM sessions');

        require_once(__DIR__ . "/../model_app_api_session_import.php");
        $updater = new model_app_api_session_import($this->parent, $this->settings);

        $count = 0;

        $errorArray = [];

        foreach ($sessions as $session) {
            $updateAction = $updater->rest('GET', ['session' => $session['id']]);
            if ($updateAction['result'] == true) $count++;
            elseif ($updateAction['result'] == false) $errorArray[] = [
                'sessionId' => $session['id'],
                'message' => $updateAction['message']
            ];
        }

        return ['updatedSessions' => $count, 'errors' => $errorArray];
    }
}
