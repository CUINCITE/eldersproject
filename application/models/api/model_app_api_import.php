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

            // safe to use, updates interviews' metadata
            "metadata" => ['interviews', 'update_interviews', 'sessions', 'locations', 'count_tags'],

            // safe to use, imports mp3 files, transcripts
            "media" => ['media'],

            // safe to use, updates sessions' records based on new transcripts files etc.
            "sessions_files_data" => ["sessions_files_data"],

            // NOT QUITE SAFE as it requires resizing images in the CMS after import
            "mementos" => ["mementos"],

            // safe to use, updates interviews indexes
            "indexes" => ['indexes'],

            // NOT SAFE!! - overwrites manual image-to-tag assignment
            "topics" => ['topics'],

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
            'locations_global' => 'LocationsGlobalImporter',
            'pdf' => 'PDFImporter',

            "sessions_files_data" => "SessionsUpdater", // UPDATER
            'update_interviews' => "InterviewsUpdater", // UPDATER
            'count_tags' => "TagCounter",

            'debug' => 'Debugger'
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
