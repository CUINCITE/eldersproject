<?php

namespace Workspace;
require_once 'HtmlUpdater.php';

class HtmlRenderer
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

    public function render($page_data)
    {
        if ($this->isAjax()) {
            $page_data['is_ajax'] = true;
        }

        $html = $this->base_template->render($page_data);
        $html = $this->updateHtml($html);

        session_start();
        error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);
        ob_start();

        echo $html;

        $length = ob_get_length();
        header('Content-Length: '.$length."\r\n");
        header('Accept-Ranges: bytes'."\r\n");
        ob_end_flush();
    }

    public function updateHtml($html) {
        $htmlUpdater = new HtmlUpdater($html);
        $html = $htmlUpdater->updateHtml();
        return $html;
    }

    public function isAjax()
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
}