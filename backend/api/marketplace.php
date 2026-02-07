<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/database.php';
include_once '../models/MarketplaceItem.php';

$database = new Database();
$db = $database->getConnection();
$item = new MarketplaceItem($db);

// ---------- ADD ITEM ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item->title = $_POST['title'] ?? '';
    $item->description = $_POST['description'] ?? '';
    $item->price = $_POST['price'] ?? 0;
    $item->seller_email = $_POST['seller_email'] ?? '';
    $item->status = 'available';

    // Handle file upload
    $item->image_url = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $targetDir = "../uploads/";
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        $fileName = basename($_FILES['image']['name']);
        $targetFile = $targetDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $item->image_url = "uploads/" . $fileName;
        }
    }

    if ($item->create()) {
        echo json_encode(["success" => true, "message" => "Item added successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to add item"]);
    }
    exit;
}

// ---------- UPDATE ITEM ----------
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
    $item->id = $data['id'] ?? 0;
    $item->title = $data['title'] ?? '';
    $item->description = $data['description'] ?? '';
    $item->price = $data['price'] ?? 0;
    $item->status = $data['status'] ?? 'available';
    $item->image_url = $data['image_url'] ?? null;

    if ($item->update()) {
        echo json_encode(["success" => true, "message" => "Item updated"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update item"]);
    }
    exit;
}

// ---------- DELETE ITEM ----------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $item->id = $data['id'] ?? 0;

    if ($item->delete()) {
        echo json_encode(["success" => true, "message" => "Item deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete item"]);
    }
    exit;
}

// ---------- GET ALL ITEMS ----------
$stmt = $item->readAll();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($items);
?>
