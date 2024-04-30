<?php

class model_app_pages_modules_map extends model_app_pages_modules
{
    public mixed $settings;
    public mixed $parent;

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function updateModel($m, $url)
    {
        
        $m['map'] = $this->getMap($m['params']);

        return $m;
    }

    private function getMap($params,$collection=0)
    {
        if ($collection) $f=['active' => 1, 'collection_hide' => 0, 'collection' => $collection];
            else $f=['active' => 1];
        $interviews = $this->parent->getJsonModel('interviews', ['active' => 1], false, null, null, ['fields' => ['label', 'slug', 'incite_id']]);
        
        if (!empty($params['global2'])) $items = $this->parent->getJsonModel('map_locations_global', $f);
        elseif (!empty($params['global'])) $items = $this->parent->getJsonModel('map_locations', $f);
        else $items=[];
        
        foreach ($items as $k => $v) {

            $quotes = [];

            if ($v['quotes']) foreach ($v['quotes'] as $kk => $vv) {
                $i = _uho_fx::array_filter($interviews, 'incite_id', $vv[2], ['first' => true]);
                if ($i && $vv[1]) {

                    $time = explode(':', $vv[1]);
                    $time = _uho_fx::dozeruj($time[0], 2) . ':' . _uho_fx::dozeruj($time[1], 2) . ':' . _uho_fx::dozeruj($time[2], 2);

                    $quotes[] =
                        [
                            'title' => $i['label'],
                            'duration' => $vv[1],
                            'start' => $this->time2seconds($time),
                            'id' => $i['id']
                        ];
                }

            }

            $items[$k]['street'] = @explode(',',$v['street'])[0];

            $items[$k]['quotes'] = $quotes;
        }


        return $items;
    }

    private function time2seconds($t)
    {
        $t = explode(':', $t);
        return $t[2] + $t[1] * 60 + $t[0] * 60 * 60;
    }


}

?>