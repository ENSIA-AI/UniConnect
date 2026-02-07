<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $first_name;
    public $last_name;
    public $username;
    public $email;
    public $password;
    public $profile_photo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new user
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET first_name=:first_name,
                      last_name=:last_name,
                      username=:username,
                      email=:email,
                      password=:password";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));

        // Hash password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind parameters
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            $this->password = $password_hash; // Store hashed password for token generation
            return true;
        }

        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id, first_name, last_name, username, email, password, profile_photo
                  FROM " . $this->table_name . "
                  WHERE email = :email
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->profile_photo = $row['profile_photo'];
            return true;
        }

        return false;
    }

    // Get user by email
    public function getByEmail($email) {
        $query = "SELECT id, first_name, last_name, username, email, profile_photo, created_at
                  FROM " . $this->table_name . "
                  WHERE email = :email
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->profile_photo = $row['profile_photo'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Get user by ID
    public function getById($id) {
        $query = "SELECT id, first_name, last_name, username, email, profile_photo, created_at
                  FROM " . $this->table_name . "
                  WHERE id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->profile_photo = $row['profile_photo'];
            $this->created_at = $row['created_at'];
            return true;
        }

        return false;
    }

    // Update user profile
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET first_name=:first_name,
                      last_name=:last_name,
                      username=:username,
                      profile_photo=:profile_photo
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->profile_photo = htmlspecialchars(strip_tags($this->profile_photo));

        // Bind
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":profile_photo", $this->profile_photo);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Update password
    public function updatePassword($new_password) {
        $query = "UPDATE " . $this->table_name . "
                  SET password=:password
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $password_hash = password_hash($new_password, PASSWORD_BCRYPT);

        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Delete user
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>