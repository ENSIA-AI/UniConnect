//process form submission
<?php
// create_lost.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = sanitize($_POST['title']);
    $category = sanitize($_POST['category']);
    $description = sanitize($_POST['description']);
    $location = sanitize($_POST['location']);
    $date_lost = sanitize($_POST['date_lost']);
    $contact_email = sanitize($_POST['contact_email']);
    
    // Basic validation
    $errors = [];
    if (empty($title)) $errors[] = "Title is required";
    if (empty($category)) $errors[] = "Category is required";
    if (empty($description)) $errors[] = "Description is required";
    if (empty($location)) $errors[] = "Location is required";
    if (empty($date_lost)) $errors[] = "Date is required";
    if (!filter_var($contact_email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required";
    
    // Handle image upload
    $image_path = null;
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] === 0) {
        $allowed = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = $_FILES['item_image']['type'];
        
        if (in_array($fileType, $allowed)) {
            $uploadDir = 'uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileName = time() . '_' . basename($_FILES['item_image']['name']);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['item_image']['tmp_name'], $targetPath)) {
                $image_path = $targetPath;
            }
        }
    }
    
    // If no errors, save to database
    if (empty($errors)) {
        try {
            $stmt = $conn->prepare("INSERT INTO lost_items (title, category, description, location, date_lost, contact_email, image_path) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([$title, $category, $description, $location, $date_lost, $contact_email, $image_path]);
            
            // Success - redirect or show message
            header('Location: lost.php?success=1');
            exit;
            
        } catch(PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
    
    // If there are errors, show them
    if (!empty($errors)) {
        session_start();
        $_SESSION['errors'] = $errors;
        $_SESSION['form_data'] = $_POST;
        header('Location: lost.php?error=1');
        exit;
    }
} else {
    header('Location: lost.php');
    exit;
}
?>