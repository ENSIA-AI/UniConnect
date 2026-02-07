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
    include_once '../models/MarketplaceItem.php';
    include_once '../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();
$item = new MarketplaceItem($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->title) || empty($data->description) || empty($data->price)) {
            http_response_code(400);
            echo json_encode(["message" => "Required fields are missing."]);
            break;
        }

        $item->title = $data->title;
        $item->description = $data->description;
        $item->price = $data->price;
        $item->seller_email = $current_user['email'];
        $item->image_url = isset($data->image_url) ? $data->image_url : '';
        $item->status = 'available';

        if($item->create()) {
            http_response_code(201);
            echo json_encode([
                "message" => "Item created successfully.",
                "item_id" => $item->id
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create item."]);
        }
        break;

    case 'GET':
        if(isset($_GET['search'])) {
            // Search items
            $stmt = $item->search($_GET['search']);
        } else {
            // Get all items
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

    case 'PUT':
        $current_user = Auth::requireAuth();
        
        $data = json_decode(file_get_contents("php://input"));

        if(empty($data->id) || empty($data->status)) {
            http_response_code(400);
            echo json_encode(["message" => "Item ID and status are required."]);
            break;
        }

        $item->id = $data->id;
        
        if($item->updateStatus($data->status)) {
            http_response_code(200);
            echo json_encode(["message" => "Status updated successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update status."]);
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