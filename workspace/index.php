<?php

namespace Workspace;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'Router.php';
require 'PageController.php';

$pageController = new \Workspace\PageController();

// Define routes and the response handler for each route
Router::addRoute('GET', '/', [$pageController, 'getIndexPage']);
Router::addRoute('GET', '/all', [$pageController, 'getAllPages']);
Router::addRoute('GET', '/(.*)', [$pageController, 'getPageData']);
Router::handleRequest();
