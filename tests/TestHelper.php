<?php

$phpDir = realpath(dirname(dirname(__FILE__)));

$temp = explode('/', $phpDir);
array_push($temp, 'app');
$temp = implode('/', $temp);
define('APP_DIR', $temp, true);
//print("\nAPP_DIR: " . APP_DIR);

$temp = explode('/', $phpDir);
array_push($temp, 'api');
$temp = implode('/', $temp);
define('API_DIR', $temp, true);
//print("\nAPI_DIR: " . API_DIR . "\n");

foreach (glob(API_DIR . "/*.php") as $filename) {
    //print("\nFilename: " . $filename . "\n");
    require_once realpath($filename);
}

?>
