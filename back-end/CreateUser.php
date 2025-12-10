<?php
// back_end/CreateUser.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['first_name']) || !isset($input['last_name']) || 
    !isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate ENSIA email format
if (!preg_match('/^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/', $input['email'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid ENSIA email format']);
    exit;
}

// Validate password
if (strlen($input['password']) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $input['email']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }
    
    // Create username from first and last name
    $username = strtolower($input['first_name']) . '.' . strtolower($input['last_name']);
    
    // Hash password
    $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
    
    // Insert new user
    $query = "INSERT INTO users 
              (first_name, last_name, email, username, password) 
              VALUES (:first_name, :last_name, :email, :username, :password)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':first_name', $input['first_name']);
    $stmt->bindParam(':last_name', $input['last_name']);
    $stmt->bindParam(':email', $input['email']);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $hashed_password);
    
    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        
        // Get the created user data (without password)
        $query = "SELECT id, first_name, last_name, email, username, profile_picture FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create user']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>