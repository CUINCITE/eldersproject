<?php

class PageDataHandler
{

    public $pages_path = '/workspace/data/pages/';
    public $modules_path = '/workspace/data/modules/';

    public $scaffold_path = '/workspace/data/scaffold/';

    public function getUri()
    {

        $uri = $_SERVER['REQUEST_URI'];
        $uri = str_replace('/workspace', '', $uri);
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = trim($uri, '/');
        $uri = strtolower($uri);

        return $uri;
    }

    public function fileExists($filepath)
    {
        return file_exists($filepath);
    }

    public function getPageData() : array
    {
        $page_name = $this->getUri();

        if ($page_name == '') {
            $page_name = 'index';
        }
        
        if ($page_name == 'all') {
            return $this->getAllPages();
        }
    
        $filepath = $_SERVER['DOCUMENT_ROOT'] . $this->pages_path . $page_name.'.json';

        if (!$this->fileExists($filepath)) {
            return $this->get404();
        }

        $page_data = $this->getJsonData($filepath);
        $page_data = $this->updateModules($page_data);
        
        if (!isset($page_data['title']))
        {
            $page_data['title'] = ucfirst($page_name);
        }

        $page_data['scaffold'] = $this->getScaffold();
    
        return $page_data;

    }

    public function updateModules($page_data)
    {
        $modules = $page_data['modules'];

        foreach ($modules as $k=>$module) {

            $filepath = $_SERVER['DOCUMENT_ROOT'] . $this->modules_path . $module['type'].'.json';

            if (!$this->fileExists($filepath)) {
                continue;
            }

            $module_data = $this->getJsonData($filepath);

            foreach ($module_data as $key=>$value) {
                if (!isset($module[$key])) {
                    $module[$key] = $value;
                }
            }

            $modules[$k] = $module;
        }

        $page_data['modules'] = $modules;

        return $page_data;
    }

    public function getJsonData($filepath)
    {
        $json_data = file_get_contents($filepath);
        $data = json_decode($json_data, true);
        return $data;
    }

    public function get404()
    {
        return [
            'title' => '404',
            'modules' => [
                [
                    'type' => '404',
                    'content' => 'Page not found'
                ]
            ]
        ];
    }

    public function getAllPages() : array 
    {
        $pages_dir = $_SERVER['DOCUMENT_ROOT'] . $this->pages_path;

        $pages = array_diff(scandir($pages_dir), array('..', '.'));

        $page_labels = [];
        foreach ($pages as $page) {
            $item = [];
            $page = pathinfo($page, PATHINFO_FILENAME);
            $item['name'] = str_replace('.json', '', ucfirst($page));
            $item['url'] = str_replace('.json', '', '/'.$page);
            $page_labels[] = $item;
        }
        return ['modules' => [['type' => 'all-pages', 'pages' => $page_labels]], 'title' => 'All Pages'];
    }

    public function getScaffold() : array
    {
        $scaffold_dir = $_SERVER['DOCUMENT_ROOT'] . $this->scaffold_path;

        $scaffold = array_diff(scandir($scaffold_dir), array('..', '.'));
        $scaffold_items = [];
        foreach ($scaffold as $scaffold_item) {

            // get key
            $item_name = pathinfo($scaffold_item, PATHINFO_FILENAME);

            //get values
            $filepath = $_SERVER['DOCUMENT_ROOT'] . $this->scaffold_path . $scaffold_item;
            $scaffold_item_data = $this->getJsonData($filepath);

            $scaffold_items[$item_name] = $scaffold_item_data;
        }

        return $scaffold_items;

    }

}