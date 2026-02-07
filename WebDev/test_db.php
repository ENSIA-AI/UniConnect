<?php
try {
    new PDO("mysql:host=localhost;dbname=uniconnect", "root", "");
    echo "DB connection OK";
} catch (PDOException $e) {
    echo $e->getMessage();
}