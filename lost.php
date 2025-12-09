//Main page with form
<?php
// lost.php
require_once 'config.php';

// Check for success/error messages
$success = isset($_GET['success']);
$errors = $_SESSION['errors'] ?? [];
$form_data = $_SESSION['form_data'] ?? [];

// Clear session messages
unset($_SESSION['errors']);
unset($_SESSION['form_data']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Lost Item</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }
        
        body {
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="date"],
        select,
        textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        textarea {
            height: 100px;
            resize: vertical;
        }
        
        .image-upload {
            border: 2px dashed #ddd;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .image-upload:hover {
            border-color: #007bff;
        }
        
        .submit-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            display: block;
            margin: 0 auto;
        }
        
        .submit-btn:hover {
            background: #0056b3;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Report Lost Item</h1>
        
        <?php if ($success): ?>
            <div class="alert success">
                ✓ Item reported successfully!
            </div>
        <?php endif; ?>
        
        <?php if (!empty($errors)): ?>
            <div class="alert error">
                <strong>Please fix the following errors:</strong>
                <ul>
                    <?php foreach ($errors as $error): ?>
                        <li><?php echo $error; ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
        
        <form action="create_lost.php" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="title">Item Title *</label>
                <input type="text" id="title" name="title" 
                       value="<?php echo htmlspecialchars($form_data['title'] ?? ''); ?>" 
                       placeholder="e.g., Lost Wallet, iPhone, Keys" required>
            </div>
            
            <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" name="category" required>
                    <option value="">Select Category</option>
                    <option value="wallet" <?php echo ($form_data['category'] ?? '') == 'wallet' ? 'selected' : ''; ?>>Wallet/Purse</option>
                    <option value="phone" <?php echo ($form_data['category'] ?? '') == 'phone' ? 'selected' : ''; ?>>Phone</option>
                    <option value="keys" <?php echo ($form_data['category'] ?? '') == 'keys' ? 'selected' : ''; ?>>Keys</option>
                    <option value="electronics" <?php echo ($form_data['category'] ?? '') == 'electronics' ? 'selected' : ''; ?>>Electronics</option>
                    <option value="book" <?php echo ($form_data['category'] ?? '') == 'book' ? 'selected' : ''; ?>>Books/Documents</option>
                    <option value="clothing" <?php echo ($form_data['category'] ?? '') == 'clothing' ? 'selected' : ''; ?>>Clothing</option>
                    <option value="other" <?php echo ($form_data['category'] ?? '') == 'other' ? 'selected' : ''; ?>>Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="description">Description *</label>
                <textarea id="description" name="description" 
                          placeholder="Describe the item in detail (color, brand, special features, contents...)" 
                          required><?php echo htmlspecialchars($form_data['description'] ?? ''); ?></textarea>
            </div>
            
            <div class="form-group">
                <label for="location">Location Lost *</label>
                <input type="text" id="location" name="location" 
                       value="<?php echo htmlspecialchars($form_data['location'] ?? ''); ?>" 
                       placeholder="e.g., Main Library, Room 204, Cafeteria" required>
            </div>
            
            <div class="form-group">
                <label for="date_lost">Date Lost *</label>
                <input type="date" id="date_lost" name="date_lost" 
                       value="<?php echo htmlspecialchars($form_data['date_lost'] ?? date('Y-m-d')); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="contact_email">Your Email *</label>
                <input type="email" id="contact_email" name="contact_email" 
                       value="<?php echo htmlspecialchars($form_data['contact_email'] ?? ''); ?>" 
                       placeholder="your.email@example.com" required>
                <div class="error-message">(We'll use this to contact you if someone finds your item)</div>
            </div>
            
            <div class="form-group">
                <label>Item Image (Optional)</label>
                <div class="image-upload" onclick="document.getElementById('item_image').click()">
                    <p>📷 Click to upload image</p>
                    <p style="font-size: 12px; color: #666;">Maximum size: 5MB (JPEG, PNG, GIF)</p>
                    <input type="file" id="item_image" name="item_image" accept="image/*" style="display: none;" 
                           onchange="previewImage(this)">
                </div>
                <div id="image-preview" style="margin-top: 10px; display: none;">
                    <img id="preview" src="#" alt="Preview" style="max-width: 200px; max-height: 150px;">
                </div>
            </div>
            
            <button type="submit" class="submit-btn">Report Lost Item</button>
        </form>
    </div>

    <script>
        function previewImage(input) {
            const preview = document.getElementById('preview');
            const previewDiv = document.getElementById('image-preview');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    previewDiv.style.display = 'block';
                }
                
                reader.readAsDataURL(input.files[0]);
            }
        }
        
        // Set max date to today
        document.getElementById('date_lost').max = new Date().toISOString().split("T")[0];
    </script>
</body>
</html>