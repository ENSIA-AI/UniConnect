<?php
require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection SUCCESS!<br>";
    
    // Test insert
    $stmt = $db->prepare("INSERT INTO lost_found_items (title, category, description, location, date_lost_found, contact_email, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([
        'Test Item', 
        'wallet', 
        'Test description', 
        'Library', 
        '2024-01-20', 
        'test@example.com', 
        'lost'
    ]);
    
    if ($result) {
        echo "Insert SUCCESS! ID: " . $db->lastInsertId();
    } else {
        echo "Insert FAILED!";
    }
} else {
    echo "Database connection FAILED!";
}
?>