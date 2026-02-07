<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/Auth.php';

try {
    // Require authentication - using your Auth::requireAuth()
    $currentUser = Auth::requireAuth();

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Read user profile
    if ($method === 'GET') {
        $user->id = $currentUser['user_id'];
        $userData = $user->readOne();
        
        if ($userData) {
            http_response_code(200);
            echo json_encode(["user" => $userData]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
        }
        exit;
    }

    // PUT - Update user profile
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $user->id = $currentUser['user_id'];
        
        // Get current user data first
        $currentData = $user->readOne();
        if (!$currentData) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            exit;
        }

        // Validate email if it's being changed
        if (isset($data['email']) && $data['email'] !== $currentData['email']) {
            // Validate ENSIA email format
            if (!preg_match('/^[a-z]+\.[a-z]+@ensia\.edu\.dz$/', $data['email'])) {
                http_response_code(400);
                echo json_encode(["error" => "Email must be in format: firstname.lastname@ensia.edu.dz"]);
                exit;
            }

            // Check if new email already exists
            $tempUser = new User($db);
            $tempUser->email = $data['email'];
            if ($tempUser->emailExists()) {
                http_response_code(409);
                echo json_encode(["error" => "Email already in use"]);
                exit;
            }
        }

        // Validate username if it's being changed
        if (isset($data['username']) && $data['username'] !== $currentData['username']) {
            $tempUser = new User($db);
            $tempUser->username = $data['username'];
            if ($tempUser->usernameExists()) {
                http_response_code(409);
                echo json_encode(["error" => "Username already taken"]);
                exit;
            }
        }
        
        // Update only provided fields
        $user->first_name = $data['first_name'] ?? $currentData['first_name'];
        $user->last_name = $data['last_name'] ?? $currentData['last_name'];
        $user->username = $data['username'] ?? $currentData['username'];
        $user->email = $data['email'] ?? $currentData['email'];
        $user->profile_photo = $data['profile_photo'] ?? $currentData['profile_photo'];
        
        if ($user->update()) {
            http_response_code(200);
            echo json_encode(["message" => "Profile updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update profile"]);
        }
        exit;
    }

    // DELETE - Delete user account
    if ($method === 'DELETE') {
        $user->id = $currentUser['user_id'];
        
        if ($user->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Account deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete account"]);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);

} catch (Exception $e) {
    error_log("MyAccount error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>