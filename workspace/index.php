<?php

namespace Workspace;

use Workspace\php\Router;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'php/Router.php';
require 'php/PageController.php';

$pageController = new php\PageController();

// Define routes and the response handler for each route
Router::addRoute('GET', '/', [$pageController, 'getIndexPage']);
Router::addRoute('GET', '/all', [$pageController, 'getAllPages']);
Router::addRoute('GET', '/(.*)', [$pageController, 'getPageData']);
Router::handleRequest();
