<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/Auth.php';  // ← Added this

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (empty($data['first_name']) || empty($data['last_name']) || 
            empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required"]);
            exit;
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email format"]);
            exit;
        }

        // Validate ENSIA email format
        if (!preg_match('/^[a-z]+\.[a-z]+@ensia\.edu\.dz$/', $data['email'])) {
            http_response_code(400);
            echo json_encode(["error" => "Email must be in format: firstname.lastname@ensia.edu.dz"]);
            exit;
        }

        // Validate password strength (minimum 6 characters)
        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(["error" => "Password must be at least 6 characters long"]);
            exit;
        }

        // Check if email already exists
        $user->email = $data['email'];
        if ($user->emailExists()) {
            http_response_code(409);
            echo json_encode(["error" => "Email already registered"]);
            exit;
        }

        // Check if username already exists
        $user->username = $data['username'];
        if ($user->usernameExists()) {
            http_response_code(409);
            echo json_encode(["error" => "Username already taken"]);
            exit;
        }

        // Set user properties
        $user->first_name = $data['first_name'];
        $user->last_name = $data['last_name'];
        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->password = $data['password'];

        // Create user
        if ($user->create()) {
            // ✅ AUTO-LOGIN: Generate token after signup
            $token = Auth::generateToken($user->id, $user->email);

            http_response_code(201);
            echo json_encode([
                "message" => "User registered successfully",
                "token" => $token,  // ← Added token
                "user" => [         // ← Added user data
                    "id" => $user->id,
                    "first_name" => $user->first_name,
                    "last_name" => $user->last_name,
                    "username" => $user->username,
                    "email" => $user->email,
                    "profile_photo" => null
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create user. Please try again."]);
        }

    } catch (Exception $e) {
        error_log("Signup error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>