<?php
// performance timer

function microtime_float()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}

    
// header

header('X-Frame-Options: SAMEORIGIN');
date_default_timezone_set('Europe/Berlin');

// index variables

$index=[
  'time_start'=>microtime_float(),
  'development'=> strpos($_SERVER['HTTP_HOST'],'.lh') || $_SERVER['HTTP_HOST']=='localhost' ? true : false,
  'root_path'=>dirname(__FILE__).'/',
  'cache_salt'=>'fya'
];

if (!$index['development'])
{
  ini_set("session.cookie_httponly", 1);
  ini_set("session.cookie_secure",1);
}

if (!is_dir($index["root_path"].'reports')) mkdir($index["root_path"].'reports');

// error handling

if ($index['development'])
{
  define("cache",false);  
  define("debug",true);
  ini_set('display_errors', 1);
  ini_set('log_errors', 1);
  $s=sprintf('%s/php-errors-%s.txt', dirname(__FILE__).'/reports', date('Ymd'));
  ini_set('error_log', $s);
  ini_set('error_reporting', E_ALL ^ E_NOTICE);
} else
{
  //if (substr($_SERVER['REQUEST_URI'],0,5)=='/api/') define("cache",false);
  //  else define("cache",true);
  define("cache",false);
  ini_set('display_errors', 1);
  ini_set('log_errors', 1);
  $s=sprintf('%s/php-errors-%s.txt', dirname(__FILE__).'/reports', date('Ymd'));
  ini_set('error_log', $s);
  ini_set('error_reporting', E_ALL ^ E_NOTICE);
}

function dd($var, $pre=false)
{
  if ($pre) echo('<pre>');
  var_dump($var);
  if ($pre) echo('</pre>');
  die();
}

// cache handler

if (cache)
{
  require($index["root_path"].'application/_uho/_uho_cache.php');
  $cache = new _uho_cache($index["cache_salt"],true,null,null,['headers'=>['Elder-Api']]);
  $cache->eraseExpired();
}

// render application from cache folder

if (cache && $cache->checkCache())
{
  $result=$cache->getCache();
  $output=$result['output'];
  $header=$result['header'];
  $cached=true;
}
else
// build application from scratch
{
	require('application/_uho/_uho_application.php');
	$app = new _uho_application($index['root_path'],$index['development'],'application_config');
  if (_uho_fx::getGet('output')) $type=_uho_fx::getGet('output'); else $type=null;
  $result=$app->getOutput($type);
	$output=$result['output'];
	$header=$result['header'];

  // store application in cache for reuse
  if (cache)
  {
	 $cache_minutes=60*24;
	 $cache->store($cache->getKey(),array('output'=>$output,'header'=>$header),$cache_minutes*60);
  }
  
}

// output

switch ($header)
{
  case "json": header('Content-Type: application/json'); break;
  case "404" : header("HTTP/1.0 404 Not Found"); break;
}

// cache randomizer

require($index["root_path"].'application/_uho/_uho_randomizer.php');
$output=ucr($output);

// output html
echo($output['html']);

// output performance timers

if ($header=='json' || $header=='rss');
elseif (isset($cached) && $cached) echo('<!-- cached in '.(microtime_float()-$index['time_start']).' -->');
  else echo('<!-- rendered in '.(microtime_float()-$index['time_start']).' -->');


?>