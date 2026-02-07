<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/database.php';
include_once '../models/StudyGroup.php';
include_once '../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();
$group = new StudyGroup($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get single group by ID (for editing)
        if(isset($_GET['id']) && !empty($_GET['id'])) {
            $group->id = $_GET['id'];
            $result = $group->readOne();
            
            if($result) {
                $row = $result->fetch(PDO::FETCH_ASSOC);
                if($row) {
                    $row['preferred_times'] = json_decode($row['preferred_times']);
                    http_response_code(200);
                    echo json_encode($row);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Study group not found."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Study group not found."]);
            }
        }
        // Search
        elseif(isset($_GET['search'])) {
            $stmt = $group->search($_GET['search']);
            $groups_arr = array();
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row['preferred_times'] = json_decode($row['preferred_times']);
                $groups_arr[] = $row;
            }

            http_response_code(200);
            echo json_encode($groups_arr);
        }
        // Get all groups
        else {
            $stmt = $group->readAll();
            $groups_arr = array();
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row['preferred_times'] = json_decode($row['preferred_times']);
                $groups_arr[] = $row;
            }

            http_response_code(200);
            echo json_encode($groups_arr);
        }
        break;

    case 'POST':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->module_name) || empty($data->contact_email) || 
           empty($data->notes) || empty($data->preferred_times)) {
            http_response_code(400);
            echo json_encode(["message" => "Required fields are missing."]);
            break;
        }

        $group->module_name = $data->module_name;
        $group->contact_email = $data->contact_email;
        $group->contact_phone = isset($data->contact_phone) ? $data->contact_phone : '';
        $group->notes = $data->notes;
        $group->preferred_times = is_array($data->preferred_times) ? 
                                   json_encode($data->preferred_times) : $data->preferred_times;
        $group->status = 'active';
        $group->user_id = $current_user['user_id']; // Changed from email to user_id

        if($group->create()) {
            http_response_code(201);
            echo json_encode([
                "message" => "Study group created successfully.",
                "group_id" => $group->id
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create study group."]);
        }
        break;

    case 'PUT':
        $current_user = Auth::requireAuth();
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Group ID is required."]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->module_name) || empty($data->contact_email) || 
           empty($data->notes) || empty($data->preferred_times)) {
            http_response_code(400);
            echo json_encode(["message" => "Required fields are missing."]);
            break;
        }

        $group->id = $_GET['id'];
        $group->module_name = $data->module_name;
        $group->contact_email = $data->contact_email;
        $group->contact_phone = isset($data->contact_phone) ? $data->contact_phone : '';
        $group->notes = $data->notes;
        $group->preferred_times = is_array($data->preferred_times) ? 
                                   json_encode($data->preferred_times) : $data->preferred_times;
        $group->status = isset($data->status) ? $data->status : 'active';

        if($group->update()) {
            http_response_code(200);
            echo json_encode(["message" => "Study group updated successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update study group."]);
        }
        break;

    case 'DELETE':
        $current_user = Auth::requireAuth();
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Group ID is required."]);
            break;
        }

        $group->id = $_GET['id'];
        
        if($group->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Study group deleted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete study group."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>