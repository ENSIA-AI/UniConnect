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
    include_once '../models/Todo.php';
    include_once '../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();
$todo = new Todo($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->title) || empty($data->due_date)) {
            http_response_code(400);
            echo json_encode(["message" => "Title and due date are required."]);
            break;
        }

        $todo->user_email = $current_user['email'];
        $todo->title = $data->title;
        $todo->description = isset($data->description) ? $data->description : '';
        $todo->due_date = $data->due_date;
        $todo->completed = isset($data->completed) ? $data->completed : false;

        if($todo->create()) {
            http_response_code(201);
            echo json_encode([
                "message" => "Todo created successfully.",
                "todo_id" => $todo->id
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create todo."]);
        }
        break;

    case 'GET':
        $current_user = Auth::requireAuth();
        
        $stmt = $todo->readByUser($current_user['email']);
        $todos_arr = array();

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $todos_arr[] = $row;
        }

        http_response_code(200);
        echo json_encode($todos_arr);
        break;

    case 'PUT':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->id)) {
            http_response_code(400);
            echo json_encode(["message" => "Todo ID is required."]);
            break;
        }

        $todo->id = $data->id;
        $todo->user_email = $current_user['email'];
        $todo->title = $data->title;
        $todo->description = isset($data->description) ? $data->description : '';
        $todo->due_date = $data->due_date;
        $todo->completed = isset($data->completed) ? $data->completed : false;

        if($todo->update()) {
            http_response_code(200);
            echo json_encode(["message" => "Todo updated successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update todo."]);
        }
        break;

    case 'DELETE':
        $current_user = Auth::requireAuth();
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Todo ID is required."]);
            break;
        }

        $todo->id = $_GET['id'];
        $todo->user_email = $current_user['email'];
        
        if($todo->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Todo deleted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete todo."]);
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