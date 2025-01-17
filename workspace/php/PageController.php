<?php

namespace Workspace\php;

require_once 'HtmlRenderer.php';

class PageController
{

    public $pages_path = '/workspace/data/pages/';
    public $modules_path = '/workspace/data/modules/';
    public $scaffold_path = '/workspace/data/scaffold/';
    private $image_dirs = [];

    public function getIndexPage() {
        return $this->getPageData('index');
    }

    public function fileExists($filepath)
    {
        return file_exists($filepath);
    }

    public function getPageData($page_name)
    {
        if (substr($page_name, 0, 1) === '/') {
            $page_name = substr($page_name, 1);
        }
    
        $filepath = $_SERVER['DOCUMENT_ROOT'] . $this->pages_path . $page_name.'.json';

        if (!$this->fileExists($filepath)) {

            $page_data = $this->get404();

        } else {

            $page_data = $this->getJsonData($filepath);
            $page_data = $this->updateModules($page_data);
            
            if (!isset($page_data['title']))
            {
                $page_data['title'] = ucfirst($page_name);
            }
            
        }

        $page_data['scaffold'] = $this->getScaffold();
        $page_data = $this->updateImages($page_data);

        if (isset($_GET['json'])) {
            $this->returnJsonResponse($page_data);
        } else $this->renderPage($page_data);

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

            if (isset($module['repeat'])) {
                $module = $this->repeatItems($module);
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

    public function getAllPages()
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

        $page_data = ['modules' => [['type' => 'all_pages', 'pages' => $page_labels]], 'title' => 'All Pages'];
        $page_data['scaffold'] = $this->getScaffold();
        $this->renderPage($page_data);
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

    public function repeatItems($data)
    {
        foreach ($data['repeat'] as $key=>$number) {
            if (!empty($data[$key])) {
                $items = $data[$key];

                $number_of_repeats = $number - count($items);

                if ($number_of_repeats > 0) {
                    for ($i=0; $i<$number_of_repeats; $i++) {
                        $items[] = $items[rand(0, count($items)-1)];
                    }
                }
            }
            $data[$key] = $items;
        }
       return $data;
    }

    public function updateImages($array) {
        foreach ($array as $key => &$value) {
            if (is_array($value)) {
                // Recursively update image paths in nested arrays.
                $value = $this->updateImages($value);
            } elseif ($key === 'image') {
                // Update image path and simulate picture tag.
                $image_path = $_SERVER['DOCUMENT_ROOT'] . '/' . $value;
    
                // Cache the image directory to avoid redundant file system checks.
                if (!isset($this->image_dirs[$image_path]) && is_dir($image_path)) {
                    $this->image_dirs[$image_path] = $image_path;
                }
    
                $image_dir = $this->image_dirs[$image_path] ?? null;
    
                if (!empty($image_dir)) {
                    $value = $this->getRandomImage($image_dir);
                }
    
                $value = $this->simulatePictureTag($value);
            }
        }
        return $array;
    }

    function getRandomImage($directory) {
        $directory = rtrim($directory, '/');
        $files = glob($directory . '/*.*');
        $file = array_rand($files);
        $file_path = $files[$file];
        $web_path = str_replace($_SERVER['DOCUMENT_ROOT'], '', $file_path);
        return str_replace('\\', '/', $web_path);
    }

    function simulatePictureTag($path) {
        return [
            'mobile' => $path,
            'mobile_x2' => $path,
            'desktop' => $path,
            'desktop_x2' => $path,
            'hd' => $path,
            'hd_x2' => $path,
        ];
    }

    public function renderPage($pageData) {
        $view = new HtmlRenderer();
        $view->render($pageData);
    }

    public function returnJsonResponse($data) {
        // Set header to indicate JSON response
        header('Content-Type: application/json');
    
        // Convert data to JSON and print
        echo json_encode($data);
    }

}