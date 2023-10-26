<?php

namespace Workspace;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'PageDataHandler.php';
require 'HtmlGenerator.php';
require 'HtmlUpdater.php';

$page_data_handler = new \Workspace\PageDataHandler();
$page_data = $page_data_handler->getPageData();

$html_generator = new \Workspace\HtmlGenerator();
$html = $html_generator->generateHtml($page_data);

$html_updater = new \Workspace\HtmlUpdater($html);
$html = $html_updater->updateHtml($html);

session_start();
error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);
ob_start();

echo $html;

$length = ob_get_length();
header('Content-Length: '.$length."\r\n");
header('Accept-Ranges: bytes'."\r\n");
ob_end_flush();