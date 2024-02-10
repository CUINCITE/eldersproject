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
        $m['map'] = $this->getMap();

        return $m;
    }



    private function time2seconds($t)
    {
        $t = explode(':', $t);
        return $t[2] + $t[1] * 60 + $t[0] * 60 * 60;
    }

    private function getMap($collection=0)
    {
        if ($collection) $f=['active' => 1, 'collection_hide' => 0, 'collection' => $collection];
            else $f=['active' => 1];
        $interviews = $this->parent->getJsonModel('interviews', ['active' => 1], false, null, null, ['fields' => ['label', 'slug']]);
        $items = $this->parent->getJsonModel('map_locations', $f);

        foreach ($items as $k => $v)
            if ($v['quotes']) foreach ($v['quotes'] as $kk => $vv) {
                    $i = _uho_fx::array_filter($interviews, 'label', $vv[0], ['first' => true]);
                    if ($i)
                        $items[$k]['quotes'][$kk] =
                            [
                                'title' => $i['label'],
                                'duration' => $vv[1],
                                'start' => $this->time2seconds($vv[1]),
                                'id' => $i['id']
                            ];
                    else
                        unset($items[$k]['quotes'][$kk]);

                }

        return $items;
    }

}

?>