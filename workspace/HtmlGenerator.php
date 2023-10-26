<?php

namespace Workspace;

class HtmlGenerator
{   
    public $debug;
    private $twig;
    public $base_template;
    public $load_partial = true;
    public $update_html = false;

    public function __construct($load_partial = true, $debug = false)
    {
        require_once $_SERVER['DOCUMENT_ROOT'].'/application/_uho/vendor/autoload.php';

        $this->debug = $debug;
    
        $loader = new \Twig\Loader\FilesystemLoader($_SERVER['DOCUMENT_ROOT']. '/workspace/views');
        $this->twig = new \Twig\Environment($loader, array('debug' => $this->debug));
        $this->base_template = $this->twig->load('base.twig');
    }

    public function generateHtml($page_data)
    {
        if ($this->isAjax()) {
            $page_data['is_ajax'] = true;
        }

        $html = $this->base_template->render($page_data);
        return $html;
    }

    public function isAjax()
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
}