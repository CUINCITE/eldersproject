<?php

namespace Workspace\php;

class Router {
    private static $routes = [];
  
    public static function addRoute($method, $path, $handler) {
      self::$routes[] = [
        'method' => $method,
        'path' => $path,
        'handler' => $handler
      ];
    }
  
    public static function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $path = preg_replace('/^\/workspace/', '', $path);
        foreach (self::$routes as $route) {
          if ($route['method'] === $method) {
            $pattern = '/^' . str_replace('/', '\/', $route['path']) . '$/';
            if (preg_match($pattern, $path, $matches)) {
              return $route['handler']($path);
            }
          }
        }
        // Handle 404 error
        echo "404 Not Found";
      }
  }