<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

include_once '../config/database.php';
include_once '../models/StudyGroup.php';
include_once '../middleware/Auth.php';

$db = (new Database())->getConnection();
$group = new StudyGroup($db);

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        if (isset($_GET['id'])) {
            $group->id = $_GET['id'];
            $stmt = $group->readOne();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(["message" => "Not found"]);
                exit;
            }

            $row['preferred_times'] = json_decode($row['preferred_times']);
            echo json_encode($row);
            exit;
        }

        $stmt = isset($_GET['search'])
            ? $group->search($_GET['search'])
            : $group->readAll();

        $out = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['preferred_times'] = json_decode($row['preferred_times']);
            $out[] = $row;
        }

        echo json_encode($out);
        break;

    case 'POST':
        $user = Auth::requireAuth();
        $data = json_decode(file_get_contents("php://input"));

        $group->module_name = $data->module_name;
        $group->contact_email = $data->contact_email;
        $group->contact_phone = $data->contact_phone ?? '';
        $group->notes = $data->notes;
        $group->preferred_times = json_encode($data->preferred_times);
        $group->status = 'active';
        $group->user_id = $user['user_id'];

        $group->create();
        echo json_encode(["message" => "Created"]);
        break;

    case 'PUT':
        Auth::requireAuth();
        $data = json_decode(file_get_contents("php://input"));

        $group->id = $_GET['id'];
        $group->module_name = $data->module_name;
        $group->contact_email = $data->contact_email;
        $group->contact_phone = $data->contact_phone ?? '';
        $group->notes = $data->notes;
        $group->preferred_times = json_encode($data->preferred_times);

        $group->update();
        echo json_encode(["message" => "Updated"]);
        break;

    case 'DELETE':
        Auth::requireAuth();
        $group->id = $_GET['id'];
        $group->delete();
        echo json_encode(["message" => "Deleted"]);
        break;
}
