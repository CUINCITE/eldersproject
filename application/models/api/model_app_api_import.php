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

        $this->parent->cache_kill();
        $action = @_uho_fx::getGet('action');
        if (!$action) return ['result' => false, 'message' => 'No Action defined'];

        $actions = match ($action) {
            "standard" => ['interviews', 'sessions', 'locations'],
            "media" => ['media'],
            "mementos" => ["mementos"],
            "indexes" => ['indexes'],
            "topics" => ['topics'],
            default => explode(',', $action),
        };

        $actionsMapping = [
            'indexes' => 'IndexImporter',
            'topics' => 'TopicsImporter',
            'interviews' => 'InterviewsImporter',
            'sessions' => 'SessionsImporter',
            'media' => 'FilesImporter',
            'mementos' => 'MementosImporter',
            'locations' => 'LocationsImporter'
        ];

        $returnArray = [];

        foreach ($actions as $action) {
            if (!isset($actionsMapping[$action])) {
                return ['result' => false, 'message' => 'Action is not supported'];
            }

            require_once(__DIR__."/import/".$actionsMapping[$action].".php");
            $importer = new $actionsMapping[$action]($this->parent, $this->settings);
            $returnValue = $importer->import();

            $returnArray[] = [
                'action' => $action,
                'actionResult' => $returnValue
            ];
        }

        return $returnArray;
     }

    private function slugify($str): string
    {
        $str = strtolower($str);
        $str = preg_replace('/[^a-z0-9\s]/', '', $str);
        $str = preg_replace('/\s/', '-', $str);
        $str = trim($str, '-');

        return $str;
    }

}
