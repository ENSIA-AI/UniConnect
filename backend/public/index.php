<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Headers - ADDED PUT METHOD
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/StudyGroup.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    $studyGroup = new StudyGroup($db);
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {

        // READ - Get all, search, or get one
        case 'GET':
            try {
                // Get single group by ID
                if (isset($_GET['id']) && !empty($_GET['id'])) {
                    $studyGroup->id = (int)$_GET['id'];
                    $group = $studyGroup->readOne();
                    
                    if ($group) {
                        // Parse preferred_times JSON
                        if (isset($group['preferred_times'])) {
                            $group['preferred_times'] = json_decode($group['preferred_times'], true);
                        }
                        http_response_code(200);
                        echo json_encode($group);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Study group not found']);
                    }
                }
                // Search
                elseif (isset($_GET['search']) && !empty($_GET['search'])) {
                    $stmt = $studyGroup->search($_GET['search']);
                    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Parse preferred_times JSON for each group
                    foreach ($groups as &$group) {
                        if (isset($group['preferred_times'])) {
                            $group['preferred_times'] = json_decode($group['preferred_times'], true);
                        }
                    }

                    http_response_code(200);
                    echo json_encode($groups);
                }
                // Get all
                else {
                    $stmt = $studyGroup->readAll();
                    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Parse preferred_times JSON for each group
                    foreach ($groups as &$group) {
                        if (isset($group['preferred_times'])) {
                            $group['preferred_times'] = json_decode($group['preferred_times'], true);
                        }
                    }

                    http_response_code(200);
                    echo json_encode($groups);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch groups: ' . $e->getMessage()]);
            }
            break;

        // CREATE - Add new study group
        case 'POST':
            try {
                // Get POST data
                $input = file_get_contents("php://input");
                $data = json_decode($input, true);

                // Debug log
                error_log("Received POST data: " . print_r($data, true));

                // Validate required fields
                if (
                    empty($data['module_name']) ||
                    empty($data['contact_email']) ||
                    empty($data['notes']) ||
                    empty($data['preferred_times'])
                ) {
                    http_response_code(400);
                    echo json_encode([
                        'error' => 'Missing required fields',
                        'received' => $data
                    ]);
                    exit;
                }

                // Validate email format
                if (!filter_var($data['contact_email'], FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid email format']);
                    exit;
                }

                // Set study group properties
                $studyGroup->module_name = htmlspecialchars(strip_tags($data['module_name']));
                $studyGroup->contact_email = htmlspecialchars(strip_tags($data['contact_email']));
                $studyGroup->contact_phone = isset($data['contact_phone']) 
                    ? htmlspecialchars(strip_tags($data['contact_phone'])) 
                    : '';
                $studyGroup->notes = htmlspecialchars(strip_tags($data['notes']));
                
                // Encode preferred_times as JSON
                $studyGroup->preferred_times = json_encode($data['preferred_times']);
                
                $studyGroup->status = 'active';
                $studyGroup->user_id = (int)($data['user_id'] ?? 1);

                // Create the study group
                if ($studyGroup->create()) {
                    http_response_code(201);
                    echo json_encode([
                        'message' => 'Study group created successfully',
                        'id' => $studyGroup->id
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create study group']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Create failed: ' . $e->getMessage()]);
            }
            break;

        // UPDATE - NEW CASE ADDED
        case 'PUT':
            try {
                if (!isset($_GET['id']) || empty($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID is required']);
                    exit;
                }

                // Get PUT data
                $input = file_get_contents("php://input");
                $data = json_decode($input, true);

                // Debug log
                error_log("Received PUT data: " . print_r($data, true));

                // Validate required fields
                if (
                    empty($data['module_name']) ||
                    empty($data['contact_email']) ||
                    empty($data['notes']) ||
                    empty($data['preferred_times'])
                ) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    exit;
                }

                // Validate email format
                if (!filter_var($data['contact_email'], FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid email format']);
                    exit;
                }

                // Set study group properties
                $studyGroup->id = (int)$_GET['id'];
                $studyGroup->module_name = htmlspecialchars(strip_tags($data['module_name']));
                $studyGroup->contact_email = htmlspecialchars(strip_tags($data['contact_email']));
                $studyGroup->contact_phone = isset($data['contact_phone']) 
                    ? htmlspecialchars(strip_tags($data['contact_phone'])) 
                    : '';
                $studyGroup->notes = htmlspecialchars(strip_tags($data['notes']));
                
                // Encode preferred_times as JSON
                $studyGroup->preferred_times = json_encode($data['preferred_times']);
                
                $studyGroup->status = isset($data['status']) ? $data['status'] : 'active';

                // Update the study group
                if ($studyGroup->update()) {
                    http_response_code(200);
                    echo json_encode(['message' => 'Study group updated successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to update study group']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Update failed: ' . $e->getMessage()]);
            }
            break;

        // DELETE - Remove study group
        case 'DELETE':
            try {
                if (!isset($_GET['id']) || empty($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID is required']);
                    exit;
                }

                $studyGroup->id = (int)$_GET['id'];

                if ($studyGroup->delete()) {
                    http_response_code(200);
                    echo json_encode(['message' => 'Study group deleted successfully']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to delete study group']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Delete failed: ' . $e->getMessage()]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>