<?php
// Prevent any HTML output
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

try {
    include_once '../config/database.php';
    include_once '../models/Module.php';
    include_once '../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();
$module = new Module($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(isset($_GET['action']) && $_GET['action'] === 'rate') {
            // Rate a module
            if(empty($data->module_id) || empty($data->rating)) {
                http_response_code(400);
                echo json_encode(["message" => "Module ID and rating are required."]);
                break;
            }
            
            $module->id = $data->module_id;
            
            if($module->addRating($current_user['email'], $data->rating)) {
                http_response_code(200);
                echo json_encode(["message" => "Rating added successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to add rating."]);
            }
        } else {
            // Create module
            if(empty($data->module_name) || empty($data->semester) || 
               empty($data->coefficient) || empty($data->module_link)) {
                http_response_code(400);
                echo json_encode(["message" => "Required fields are missing."]);
                break;
            }

            $module->module_name = $data->module_name;
            $module->semester = $data->semester;
            $module->coefficient = $data->coefficient;
            $module->owner_email = $current_user['email'];
            $module->module_link = $data->module_link;
            $module->image_url = isset($data->image_url) ? $data->image_url : '';
            $module->description = isset($data->description) ? $data->description : '';
            $module->resources_count = isset($data->resources_count) ? $data->resources_count : 0;

            if($module->create()) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Module created successfully.",
                    "module_id" => $module->id
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create module."]);
            }
        }
        break;

    case 'GET':
        if(isset($_GET['id'])) {
            // Get single module
            $module->id = $_GET['id'];
            $result = $module->readOne();
            
            if($result) {
                http_response_code(200);
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Module not found."]);
            }
        } else {
            // Get all modules
            $stmt = $module->readAll();
            $modules_arr = array();

            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $modules_arr[] = $row;
            }

            http_response_code(200);
            echo json_encode($modules_arr);
        }
        break;

    case 'DELETE':
        $current_user = Auth::requireAuth();
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Module ID is required."]);
            break;
        }

        $module->id = $_GET['id'];
        
        if($module->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Module deleted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete module."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>