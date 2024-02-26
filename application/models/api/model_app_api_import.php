<?php

class model_app_api_import
{


    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function rest($method, $params)
    {

        if (!str_contains($_SERVER['HTTP_HOST'],'.lh') && getenv('SQL_HOST') !== 'localhost' && getenv('S3_BUCKET')) {
            exit('Import functionality is only available on localhost and for local databases.');
        }

        $this->parent->cache_kill();
        $action = @_uho_fx::getGet('action');
        if (!$action) return ['result' => false, 'message' => 'No Action defined'];

        $actions = match ($action) {
            "metadata" => ['interviews', 'update_interviews', 'sessions', 'locations'], // safe to use
            "media" => ['media'], // safe
            "sessions_files_data" => ["sessions_files_data"], //safe
            "mementos" => ["mementos"], // requires resising images in serdelia after import
            "indexes" => ['indexes'], // safe
            "topics" => ['topics'], // NOT SAFE!! - overwrites manual image-to-tag assignment
            default => explode(',', $action),
        };

        $actions2ClassesMap = [
            'indexes' => 'IndexImporter',
            'topics' => 'TopicsImporter',
            'interviews' => 'InterviewsImporter',
            'sessions' => 'SessionsImporter',
            'media' => 'FilesImporter',
            'mementos' => 'MementosImporter',
            'locations' => 'LocationsImporter',
            "sessions_files_data" => "SessionsUpdater",
            'update_interviews' => "InterviewsUpdater"
        ];

        $resultArray = [];

        foreach ($actions as $action) {
            if (!isset($actions2ClassesMap[$action])) {
                return ['result' => false, 'message' => 'Action is not supported: ' . $action];
            }

            require_once(__DIR__."/import/".$actions2ClassesMap[$action].".php");
            $importer = new $actions2ClassesMap[$action]($this->parent, $this->settings);
            $actionResult = $importer->import();

            $resultArray[] = [
                'action' => $action,
                'actionResult' => $actionResult
            ];
        }

        return $resultArray;
     }

    public function slugify($str): string
    {
        $str = strtolower($str);
        $str = preg_replace('/[^a-z0-9\s]/', '', $str);
        $str = preg_replace('/\s/', '-', $str);
        $str = trim($str, '-');

        return $str;
    }

}
