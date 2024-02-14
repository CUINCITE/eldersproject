<?php

class model_app_pages_modules_interviews extends model_app_pages_modules
{

    private int $itemsPerPage = 300;

    function __construct($parent, $settings)
    {
        $this->parent = $parent;
        $this->settings = $settings;
    }

    public function updateModel($m, $url)
    {
        
        // return 404 if a user hits single interview url and no interview is found
        if (!empty($url[1]))
        {
            $item = $this->parent->getJsonModel('interviews', ['active' => 1, 'slug' => $url[1]], true);

            if (!$item) {
                $this->parent->set404();
                return $m;
            }

            else $this->parent->ogSet($item['label'], $item['lead']);
        }

        // Calculate pagination variables
        $itemsPerPage = $this->itemsPerPage;
        $page = 1;
        $isPartial = (!empty($this->settings['get']['partial']));

        if (!empty($this->settings['get']['page']) && is_numeric($this->settings['get']['page'])) {
            $page = (int)$this->settings['get']['page'];
        }

        // startingPage & numberOfItems variables are used in getJsonModel method later
        $startingPage = $isPartial ? $page : 1;
        $numberOfItems = $isPartial ? $itemsPerPage : $page * $itemsPerPage;
        

        //filters in the query
        $input = [
            'collections' => ['collections', 'interviewers'],
            'topics' => ['topics', 'topics'],
            'states' => ['states', 'narrators_states']
        ];

        $filters = ['active' => 1];
        foreach ($input as $param => $dictionaries) {
            $filter = false;

            if (!empty($this->settings['get'][$param])) {
                $filter = $this->getModelFilter($dictionaries[0], $this->settings['get'][$param]);
                if (!empty($filter)) $filters[$dictionaries[1]] = $filter;
            }

            $m[$param] = $this->filterUpdate($this->parent->dictGet($dictionaries[0]), $filter);

        }


        $m['states'] = array_filter($m['states'], function ($state) {
            return isset($state['count_interviews']) && $state['count_interviews'] > 0;
        });
        
        
        // define sort variables
        $m['sort'] = $this->handleSortVariables();

        /*
            Get Interviews and supplement it with Filters and Load More data
        */

        

        $m['items'] = $this->parent->getJsonModel('interviews_list', $filters, false, $m['sort']['sort_model'], [$startingPage, $numberOfItems]);

        // remove duplicated states
        $m['items'] = array_map(function ($item) {
            $item['type'] = 'single';
            if (is_array($item['narrators_states'])) {
                $item['narrators_states'] = array_map("unserialize", array_unique(array_map("serialize", $item['narrators_states'])));
            }
            return $item;
        }, $m['items']);

        // Check if load more items
        $m['load_more'] = $this->checkForMoreItems(count($m['items']), $itemsPerPage, $page, $url, $filters, $m['sort']['sort_model']);

        // Add filter tags to the interview list
//        $m['items'] = $this->addFiltersToItems($m['items'], $m['topics'], $m['states'], 10, $itemsPerPage, 3, $startingPage);

        $m['items'] = $this->addTagsToInterviews($m['items'], $m['topics'], $m['states'], $itemsPerPage, $startingPage);
        
        return $m;
    }

    private function checkForMoreItems($itemsCount, $itemsPerPage, $page, $uri, $filters, $sortModel): bool|string
    {
        if ($itemsCount >= $itemsPerPage) {
            $startingPage = $page * $itemsPerPage + 1;
            $newItem = $this->parent->getJsonModel('interviews_list', $filters, false, $sortModel, [$startingPage, 1]);

            if ($newItem) {
                return $this->getNextPageUri($page, $uri);
            }
        }

        return false;
    }

    private function handleSortVariables(): array
    {
        $sort = !empty($this->settings['get']['sort']) ? $this->settings['get']['sort'] : 'narrators';
        $returnArray = [];
        $returnArray['selected'] = $sort;
        if ($sort[0] == '!') {
            $desc = true;
            $sort = substr($sort, 1);
        } else $desc = false;

        $returnArray['url_narrator'] = $this->getSort('narrators', $sort, $desc);
        $returnArray['url_locations'] = $this->getSort('locations', $sort, $desc);
        $returnArray['url_collections'] = $this->getSort('collections', $sort, $desc);

        $sort_model = 'label_sort';

        switch ($sort) {
            case "narrators":
                $sort_model = 'label_sort';
                $returnArray['arrow_narrator'] = '↓';
                if ($desc) {
                    $sort_model .= ' DESC';
                    $m['sort']['arrow_narrator'] = '↑';
                }
                break;
            case "collections":
                $sort_model = 'interviewer_name_sort';
                $returnArray['arrow_collections'] = '↓';
                if ($desc) {
                    $sort_model .= ' DESC';
                    $m['sort']['arrow_collections'] = '↑';
                }
                break;
            case "locations":
                $sort_model = 'locations';
                $returnArray['arrow_locations'] = '↓';
                if ($desc) {
                    $sort_model .= ' DESC';
                    $m['sort']['arrow_locations'] = '↑';
                }
                break;
        }

        $returnArray['sort_model'] = $sort_model;

        return $returnArray;
    }

    private function getSort($item, $sort_now, $desc_now)
    {

        if ($item == $sort_now) {
            $sort = $sort_now;
            if (!$desc_now) $sort = '!' . $sort;
        } else $sort = $item;

        $url = ['type' => 'url_now', 'get' => ['sort' => $sort]];
        return $url;
    }

    private function filterUpdate($items, $filters)
    {
        if (!$filters) return $items;

        if (!is_array($filters)) $filters = explode(',', $filters);

        if ($filters) {
            foreach ($items as $k => $v)
                $items[$k]['selected'] = in_array($v['id'], $filters);
        }
        
        return $items;
    }

    private function getModelFilter($dict, $slug)
    {
        $slugs = explode(',', $slug);
        $return_array = [];

        foreach ($slugs as $slug) {
            $item = $this->parent->dictGet($dict, $slug);
            if ($item) $return_array[] = $item['id'];
        }

        if (!empty($return_array)) {
            return (count($return_array) == 1) ? $return_array[0] : $return_array;
        }

        return [];

    }

    function getNextPageUri($current_page, $url): string
    {

        $allowedParams = ['page', 'sort', 'collections', 'topics', 'states'];
        $params = _uho_fx::getGetArray();

        foreach ($params as $k => $v) {
            if (!in_array($k, $allowedParams)) unset($params[$k]);
        }

        $params['page'] = $current_page + 1;
        $uri = '/' . implode('/', $url);

        return $uri . '?' . http_build_query($params);
    }

    private function getFilterUrl($filter): array
    {
        //return ['type' => 'interview_filter', 'slug' => $filter['slug'],
        //    'filter_type' => $filter['filter_type']];
        return['type'=>'interviews',$filter['filter_type']=>[$filter['slug']]];
    }

    private function addTagsToInterviews($items, $topics, $states) {

        $states = array_filter($states, function ($state) {
            return isset($state['count_interviews']) && $state['count_interviews'] > 10;
        });

        $filters = array_merge(
            array_map(fn($topic) => ['filter_type' => 'topics', 'type' => 'filter'] + $topic, $topics),
            array_map(fn($state) => ['filter_type' => 'states', 'type' => 'filter'] + $state, $states)
        );

        // Different seed every day
        mt_srand(date('z'));
        shuffle($filters);

        //Remove already selected filters from the list
        $filters = array_filter($filters, fn($item) => empty($item['selected']));
        $filters = array_values($filters);
        
        $newItems = [];
        $lastLetter = null;
        $i = 0;

        $modifiers = ['pink', 'pale-purple', 'pink-alt', 'green'];
        $minimum_distance=8;
        $last_index=-4;

        foreach ($items as $k=>$v) {

            if ($lastLetter !== strtoupper(substr($v['label_sort'], 0, 1)))
            {
                $lastLetter = strtoupper(substr($v['label_sort'], 0, 1));
                $i++;

                if ($i > 1 && ($k-$last_index>=$minimum_distance))
                {
                    $last_index=$k;
                    $filter = array_shift($filters);
                    if ($filter)
                    {
                        $filter['url'] = $this->getFilterUrl($filter);
                        $randomKey = array_rand($modifiers);
                        $filter['modifier'] = $modifiers[$randomKey];
                        $newItems[] = $filter;
                    }
                }
            }

            $newItems[] = $v;
        }

        return $newItems;

    }

}

?>