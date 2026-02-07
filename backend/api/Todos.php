<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/database.php';
include_once '../models/Todo.php';

$database = new Database();
$db = $database->getConnection();
$todo = new Todo($db);

$method = $_SERVER['REQUEST_METHOD'];


$DEFAULT_EMAIL = "test@ensia.edu.dz";

switch($method) {
    case 'POST':
        // Create new todo
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->title) || empty($data->due_date)) {
            http_response_code(400);
            echo json_encode(["message" => "Title and due date are required."]);
            break;
        }

        $todo->user_email = $DEFAULT_EMAIL;
        $todo->title = $data->title;
        $todo->description = isset($data->description) ? $data->description : '';
        $todo->due_date = $data->due_date;
        $todo->completed = isset($data->completed) ? $data->completed : false;

        if($todo->create()) {
            http_response_code(201);
            echo json_encode([
                "message" => "Todo created successfully.",
                "id" => $todo->id,
                "todo" => [
                    "id" => $todo->id,
                    "title" => $todo->title,
                    "description" => $todo->description,
                    "due_date" => $todo->due_date,
                    "completed" => $todo->completed
                ]
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create todo."]);
        }
        break;

    case 'GET':
        // Get all todos
        $stmt = $todo->readByUser($DEFAULT_EMAIL);
        $todos_arr = array();

        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $todos_arr[] = $row;
        }

        http_response_code(200);
        echo json_encode($todos_arr);
        break;

    case 'PUT':
        // Update todo
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->id)) {
            http_response_code(400);
            echo json_encode(["message" => "Todo ID is required."]);
            break;
        }

        $todo->id = $data->id;
        $todo->user_email = $DEFAULT_EMAIL;
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
        // Delete todo
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Todo ID is required."]);
            break;
        }

        $todo->id = $_GET['id'];
        $todo->user_email = $DEFAULT_EMAIL;
        
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
?>