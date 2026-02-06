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
require_once __DIR__ . '/../middleware/Auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);

        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required"]);
            exit;
        }

        // Check if user exists
        $user->email = $data['email'];
        if (!$user->emailExists()) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password"]);
            exit;
        }

        // Verify password
        if (password_verify($data['password'], $user->password)) {
            // Generate JWT token
            $token = Auth::generateToken($user->id, $user->email);

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => $user->id,
                    "first_name" => $user->first_name,
                    "last_name" => $user->last_name,
                    "username" => $user->username,
                    "email" => $user->email,
                    "profile_photo" => $user->profile_photo
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password"]);
        }

    } catch (Exception $e) {
        error_log("Signin error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>