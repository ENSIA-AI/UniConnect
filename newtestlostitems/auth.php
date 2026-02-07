<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/user.php';
require_once __DIR__ . '/middleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    $user = new User($db);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $action = isset($_GET['action']) ? $_GET['action'] : '';

        if($action === 'register') {
            // Validate required fields
            if(empty($data->first_name) || empty($data->last_name) || 
               empty($data->email) || empty($data->password)) {
                http_response_code(400);
                echo json_encode(["message" => "Unable to create user. Data is incomplete."]);
                break;
            }

            // Validate email format
            if(!preg_match('/^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/', $data->email)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid email format. Must be firstname.lastname@ensia.edu.dz"]);
                break;
            }

            // Check if email already exists
            $user->email = $data->email;
            if($user->emailExists()) {
                http_response_code(400);
                echo json_encode(["message" => "Email already exists."]);
                break;
            }

            // Set user properties
            $user->first_name = $data->first_name;
            $user->last_name = $data->last_name;
            $user->username = strtolower($data->first_name . '.' . $data->last_name);
            $user->email = $data->email;
            $user->password = $data->password;

            // Create user
            if($user->create()) {
                http_response_code(201);
                
                $token = Auth::generateToken($user->id, $user->email);
                
                setcookie('auth_token', $token, time() + (86400 * 7), "/", "", false, true);
                
                echo json_encode([
                    "message" => "User was created successfully.",
                    "token" => $token,
                    "user" => [
                        "id" => $user->id,
                        "first_name" => $user->first_name,
                        "last_name" => $user->last_name,
                        "username" => $user->username,
                        "email" => $user->email
                    ]
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create user."]);
            }
        } 
        elseif($action === 'login') {
            if(empty($data->email) || empty($data->password)) {
                http_response_code(400);
                echo json_encode(["message" => "Email and password are required."]);
                break;
            }

            $user->email = $data->email;

            if($user->emailExists()) {
                if(password_verify($data->password, $user->password)) {
                    http_response_code(200);
                    
                    $token = Auth::generateToken($user->id, $user->email);
                    
                    setcookie('auth_token', $token, time() + (86400 * 7), "/", "", false, true);
                    
                    echo json_encode([
                        "message" => "Login successful.",
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
                    echo json_encode(["message" => "Invalid password."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "User not found."]);
            }
        }
        break;

    case 'GET':
        $current_user = Auth::requireAuth();
        
        $user->getByEmail($current_user['email']);
        
        http_response_code(200);
        echo json_encode([
            "user" => [
                "id" => $user->id,
                "first_name" => $user->first_name,
                "last_name" => $user->last_name,
                "username" => $user->username,
                "email" => $user->email,
                "profile_photo" => $user->profile_photo
            ]
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>