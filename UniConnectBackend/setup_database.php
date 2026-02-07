<?php
/**
 * Database Setup Script
 * This script initializes the database and tables from the schema.sql file
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$dbHost = 'localhost';
$dbPort = 3308;
$dbUser = 'root';
$dbPass = '';

echo "Starting database setup...\n";

try {
    // Connect without specifying a database to create it
    $conn = new PDO(
        "mysql:host=$dbHost;port=$dbPort",
        $dbUser,
        $dbPass
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read the schema file
    $schemaFile = __DIR__ . '/shema.sql';
    
    if (!file_exists($schemaFile)) {
        die("ERROR: schema.sql file not found at: $schemaFile\n");
    }
    
    $schema = file_get_contents($schemaFile);
    
    // Split the schema into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $schema)),
        function($stmt) { return !empty($stmt) && strpos($stmt, '--') === false; }
    );
    
    // Execute each statement
    foreach ($statements as $statement) {
        if (trim($statement)) {
            $conn->exec($statement);
            echo "✓ Executed: " . substr(trim($statement), 0, 50) . "...\n";
        }
    }
    
    echo "\n✓ Database setup completed successfully!\n";
    
    // Verify the connection to uniconnect database
    $testConn = new PDO(
        "mysql:host=$dbHost;port=$dbPort;dbname=uniconnect",
        $dbUser,
        $dbPass
    );
    
    // Check if lost_found_items table exists
    $stmt = $testConn->query("SHOW TABLES LIKE 'lost_found_items'");
    if ($stmt->rowCount() > 0) {
        echo "✓ lost_found_items table confirmed\n";
    }
    
    echo "\n✓ You can now test your application at: http://localhost:8000/lost.html\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
