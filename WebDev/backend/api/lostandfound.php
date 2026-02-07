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
    include_once '../models/LostFoundItem.php';
    include_once '../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();
$item = new LostFoundItem($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->title) || empty($data->category) || empty($data->description) || 
           empty($data->location) || empty($data->date_lost_found) || empty($data->status)) {
            http_response_code(400);
            echo json_encode(["message" => "Required fields are missing."]);
            break;
        }

        $item->title = $data->title;
        $item->category = $data->category;
        $item->description = $data->description;
        $item->location = $data->location;
        $item->date_lost_found = $data->date_lost_found;
        $item->contact_email = $current_user['email'];
        $item->storage_location = isset($data->storage_location) ? $data->storage_location : '';
        $item->image_url = isset($data->image_url) ? $data->image_url : '';
        $item->status = $data->status;

        if($item->create()) {
            http_response_code(201);
            echo json_encode([
                "message" => "Item reported successfully.",
                "item_id" => $item->id
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to report item."]);
        }
        break;

    case 'GET':
        if(isset($_GET['search'])) {
            $stmt = $item->search($_GET['search']);
        } elseif(isset($_GET['status'])) {
            $stmt = $item->readByStatus($_GET['status']);
        } else {
            $stmt = $item->readAll();
        }
        
        $items_arr = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items_arr[] = $row;
        }

        http_response_code(200);
        echo json_encode($items_arr);
        break;

    case 'DELETE':
        $current_user = Auth::requireAuth();
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Item ID is required."]);
            break;
        }

        $item->id = $_GET['id'];
        
        if($item->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Item deleted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to delete item."]);
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