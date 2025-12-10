<?php
// back-end/DeleteUser.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'ID and password are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    // First, verify the user's password
    $query = "SELECT password FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify password
    if (!password_verify($input['password'], $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        exit;
    }
    
    // Delete the user
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['id']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete account']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>