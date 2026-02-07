<?php
require_once 'database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if (!$conn) {
        echo "ERROR: Could not connect to database\n";
        exit(1);
    }
    
    echo "Connected to database successfully\n";
    
    // Check tables exist
    $stmt = $conn->query("SHOW TABLES LIKE 'lost_found_items'");
    if ($stmt->rowCount() > 0) {
        echo "✓ lost_found_items table exists\n";
    } else {
        echo "✗ lost_found_items table NOT found\n";
        exit(1);
    }
    
    // Count items
    $result = $conn->query("SELECT COUNT(*) as count FROM lost_found_items");
    $row = $result->fetch(PDO::FETCH_ASSOC);
    echo "Items in database: " . $row['count'] . "\n";
    
    // List all items
    $result = $conn->query("SELECT id, title, status, created_at FROM lost_found_items ORDER BY created_at DESC LIMIT 10");
    echo "\nRecent items:\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "  ID: {$row['id']}, Title: {$row['title']}, Status: {$row['status']}, Created: {$row['created_at']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
