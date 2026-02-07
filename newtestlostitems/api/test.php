<?php
header("Content-Type: application/json");
echo json_encode([
    "status" => "ok",
    "message" => "API is working",
    "method" => $_SERVER['REQUEST_METHOD'],
    "php_version" => phpversion()
]);
?>
