<?php
// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required files - FIXED: Use correct paths
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../model.php';
require_once __DIR__ . '/../middleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed - returned null');
    }
    
    $item = new LostFoundItem($db);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Setup error',
        'message' => $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        try {
            // Get raw input
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON: ' . json_last_error_msg());
            }
            
            if (!$data) {
                throw new Exception('No data received');
            }
            
            // FIXED: Check authentication
            $current_user = Auth::getCurrentUser();
            if ($current_user && isset($current_user['email'])) {
                // User is authenticated - use their email
                $contact_email = $current_user['email'];
            } else {
                // User is not authenticated - use provided email
                $contact_email = isset($data->contact_email) ? $data->contact_email : '';
                
                if (empty($contact_email)) {
                    throw new Exception("Contact email is required for unauthenticated users");
                }
            }
            
            // Validation
            if (empty($data->title)) throw new Exception("Title is required");
            if (empty($data->category)) throw new Exception("Category is required");
            if (empty($data->description)) throw new Exception("Description is required");
            if (empty($data->location)) throw new Exception("Location is required");
            if (empty($data->date_lost_found)) throw new Exception("Date is required");
            if (empty($data->status)) throw new Exception("Status is required");
            if (empty($contact_email)) throw new Exception("Contact email is required");
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data->date_lost_found)) {
                throw new Exception("Invalid date format. Use YYYY-MM-DD");
            }
            
            // Set item properties
            $item->title = $data->title;
            $item->category = $data->category;
            $item->description = $data->description;
            $item->location = $data->location;
            $item->date_lost_found = $data->date_lost_found;
            $item->contact_email = $contact_email;
            $item->storage_location = isset($data->storage_location) ? $data->storage_location : null;
            $item->image_url = isset($data->image_url) ? $data->image_url : null;
            $item->status = $data->status;

            // Create item
            if ($item->create()) {
                // DEBUG: Verify the item was actually inserted
                $check_stmt = $db->prepare("SELECT * FROM lost_found_items WHERE id = :id");
                $check_stmt->bindParam(":id", $item->id);
                $check_stmt->execute();
                $check_result = $check_stmt->fetch(PDO::FETCH_ASSOC);
                
                $verified = !empty($check_result);
                
                http_response_code(201);
                echo json_encode([
                    "message" => "Item reported successfully.",
                    "item_id" => $item->id,
                    "status" => "success",
                    "verified_in_database" => $verified ? "YES" : "NO",
                    "user_authenticated" => ($current_user ? "YES" : "NO"),
                    "data" => [
                        'id' => $item->id,
                        'title' => $item->title,
                        'category' => $item->category,
                        'status' => $item->status,
                        'contact_email' => $item->contact_email,
                        'created_at' => $item->created_at
                    ]
                ]);
            } else {
                throw new Exception("create() method returned false");
            }
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                "message" => "Error creating item",
                "error" => $e->getMessage(),
                "status" => "error"
            ]);
        }
        break;

    case 'GET':
        try {
            if (isset($_GET['search'])) {
                $stmt = $item->search($_GET['search']);
            } elseif (isset($_GET['status'])) {
                $stmt = $item->readByStatus($_GET['status']);
            } else {
                $stmt = $item->readAll();
            }
            
            $items_arr = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $items_arr[] = $row;
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "count" => count($items_arr),
                "data" => $items_arr
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "message" => "Error fetching items",
                "error" => $e->getMessage(),
                "status" => "error"
            ]);
        }
        break;

    case 'DELETE':
        try {
            // DELETE requires authentication
            $current_user = Auth::requireAuth();
            
            if (!isset($_GET['id'])) {
                throw new Exception("Item ID is required.");
            }

            $item->id = $_GET['id'];
            
            if ($item->delete()) {
                http_response_code(200);
                echo json_encode([
                    "message" => "Item deleted successfully.",
                    "status" => "success"
                ]);
            } else {
                throw new Exception("Unable to delete item");
            }
            
        } catch (Exception $e) {
            $status_code = ($e->getMessage() === "Unauthorized - Invalid or expired token") ? 401 : 400;
            http_response_code($status_code);
            echo json_encode([
                "message" => "Error deleting item",
                "error" => $e->getMessage(),
                "status" => "error"
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode([
            "message" => "Method not allowed",
            "status" => "error"
        ]);
        break;
}
?>