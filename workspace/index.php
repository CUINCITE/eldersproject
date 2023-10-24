<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// get the page data from the json files
require 'PageDataHandler.php';
$page_data_handler = new PageDataHandler();
$page_data = $page_data_handler->getPageData();

// compile the html
require 'HtmlGenerator.php';
$html_generator = new HtmlGenerator();
$html = $html_generator->generateHtml($page_data);

// update the html
require 'HtmlUpdater.php';
$html_updater = new HtmlUpdater($html);
$html = $html_updater->updateHtml($html);

// render the html
session_start();
error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);
ob_start();

echo $html;

$length = ob_get_length();
header('Content-Length: '.$length."\r\n");
header('Accept-Ranges: bytes'."\r\n");
ob_end_flush();



