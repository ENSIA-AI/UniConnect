<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    new PDO("mysql:host=localhost;dbname=uniconnect", "root", "");
    echo "DB connection OK";
} catch (PDOException $e) {
    echo $e->getMessage();
}
?>
