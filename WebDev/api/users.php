<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

require_once __DIR__ . "/../backend/config/database.php";

try {
    $stmt = $conn->query("SELECT id, email FROM users"); // select real data
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);         // fetch as array
    echo json_encode($users);                            // return JSON
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
