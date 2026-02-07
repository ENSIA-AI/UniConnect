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

echo "Starting database setup...\n\n";

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
    
    // Clean up the schema - remove comments and empty lines
    $schema = preg_replace('/--.*$/m', '', $schema); // Remove -- comments
    $schema = preg_replace('/\/\*.*?\*\//s', '', $schema); // Remove /* */ comments
    $schema = preg_replace('/\s+/', ' ', $schema); // Replace multiple whitespace with single space
    
    // Split the schema into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $schema)),
        function($stmt) { 
            return !empty($stmt) && strlen(trim($stmt)) > 0;
        }
    );
    
    echo "Executing " . count($statements) . " SQL statements...\n\n";
    
    // Execute each statement
    $successCount = 0;
    foreach ($statements as $index => $statement) {
        $cleanStatement = trim($statement);
        if (!empty($cleanStatement)) {
            try {
                // Add a small delay for InnoDB to process
                if ($index > 0) {
                    usleep(50000); // 0.05 second delay between statements
                }
                
                $conn->exec($cleanStatement);
                $successCount++;
                
                // Show what was executed (truncated for display)
                $display = substr($cleanStatement, 0, 80);
                if (strlen($cleanStatement) > 80) {
                    $display .= '...';
                }
                echo "✓ Statement " . ($index + 1) . ": $display\n";
                
            } catch (PDOException $e) {
                echo "✗ Error in statement " . ($index + 1) . ": " . $e->getMessage() . "\n";
                echo "  Statement: " . substr($cleanStatement, 0, 100) . "...\n";
                // Continue with next statement
            }
        }
    }
    
    echo "\n✓ Executed $successCount of " . count($statements) . " statements successfully!\n";
    
    // Verify the connection to uniconnect database
    $testConn = new PDO(
        "mysql:host=$dbHost;port=$dbPort;dbname=uniconnect",
        $dbUser,
        $dbPass
    );
    $testConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check all tables
    echo "\nVerifying tables...\n";
    $tables = ['users', 'modules', 'module_ratings', 'marketplace_items', 'study_groups', 'lost_found_items', 'todos'];
    
    foreach ($tables as $table) {
        $stmt = $testConn->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✓ $table table exists\n";
        } else {
            echo "✗ $table table NOT found\n";
        }
    }
    
    // Check foreign keys on lost_found_items specifically
    echo "\nChecking foreign keys on lost_found_items table...\n";
    try {
        $fkStmt = $testConn->query("SHOW CREATE TABLE lost_found_items");
        $result = $fkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (isset($result['Create Table'])) {
            $createTable = $result['Create Table'];
            
            // Check for foreign key constraint
            if (strpos($createTable, 'FOREIGN KEY') !== false) {
                echo "✓ Foreign key constraint found on lost_found_items\n";
                
                // Extract and display the foreign key
                preg_match('/FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)` \(`([^`]+)`\)/', $createTable, $matches);
                if (count($matches) >= 4) {
                    echo "  - Column: {$matches[1]} references {$matches[2]}.{$matches[3]}\n";
                }
            } else {
                echo "⚠ No foreign key constraint found on lost_found_items\n";
                echo "  You may need to add it manually with:\n";
                echo "  ALTER TABLE lost_found_items ADD FOREIGN KEY (contact_email) REFERENCES users(email) ON DELETE CASCADE;\n";
            }
        }
    } catch (Exception $e) {
        echo "⚠ Could not check table structure: " . $e->getMessage() . "\n";
    }
    
    // Count users
    $countStmt = $testConn->query("SELECT COUNT(*) as count FROM users");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC);
    echo "\n✓ Users in database: " . $count['count'] . "\n";
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "✓ DATABASE SETUP COMPLETED!\n";
    echo "✓ Test your application at: http://localhost:8000/lost.html\n";
    echo str_repeat("=", 60) . "\n";
    
} catch (PDOException $e) {
    echo "\n❌ FATAL ERROR: " . $e->getMessage() . "\n";
    
    if (strpos($e->getMessage(), 'Connection refused') !== false) {
        echo "\nTroubleshooting:\n";
        echo "1. Check if MySQL is running on port $dbPort\n";
        echo "2. Check XAMPP Control Panel\n";
        echo "3. Try: mysql -u root -P $dbPort\n";
    }
    
    exit(1);
}
?>