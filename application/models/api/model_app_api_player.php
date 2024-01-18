<?php

class model_app_api_player
{

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    //"_comment": "same structure for: 1)[organizations, events, topics, places, people], 2)[interviews, clips]",

    public function rest($method, $params)
    {
        if (empty($params['id'])) {
            $item = $this->parent->getJsonModel('interviews', ['active' => 1], true, 'rand()');
        } else $item = $this->parent->getJsonModel('interviews', ['active' => 1, 'id' => $params['id']], true);

        if (!$item) return null; else {
            $sessions = $this->parent->getJsonModel('sessions', ['active' => 1, 'parent' => $item['id']], false, 'nr');
            if (!$sessions) return null;
        }

        return $this->getPlayerData($item, $sessions);

    }

    public function getPlayerData($item, $sessions)
    {
        $src = [];
        foreach ($sessions as $session) {
            $src[] = [
                'src' => $session['audio']['src'],
                'duration' => $session['duration']
            ];
        }
        return [
            'id' => $item['id'],
            'title' => $item['label'],
            'src' => $src,
            'urlInterview' => ['type' => 'interview', 'slug' => $item['slug']],
        ];
    }


}
