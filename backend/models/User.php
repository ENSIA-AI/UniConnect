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

    // CREATE - Sign Up
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (first_name, last_name, username, email, password) 
                  VALUES 
                  (:first_name, :last_name, :username, :email, :password)";

        try {
            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->first_name = htmlspecialchars(strip_tags($this->first_name));
            $this->last_name = htmlspecialchars(strip_tags($this->last_name));
            $this->username = htmlspecialchars(strip_tags($this->username));
            $this->email = htmlspecialchars(strip_tags($this->email));

            // Hash password
            $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);

            // Bind parameters
            $stmt->bindParam(":first_name", $this->first_name);
            $stmt->bindParam(":last_name", $this->last_name);
            $stmt->bindParam(":username", $this->username);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $hashed_password);

            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;

        } catch (PDOException $e) {
            error_log("User create error: " . $e->getMessage());
            return false;
        }
    }

    // READ ONE - Get user by ID
    public function readOne() {
        $query = "SELECT id, first_name, last_name, username, email, profile_photo, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $this->first_name = $row['first_name'];
                $this->last_name = $row['last_name'];
                $this->username = $row['username'];
                $this->email = $row['email'];
                $this->profile_photo = $row['profile_photo'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];

                return $row;
            }

            return false;

        } catch (PDOException $e) {
            error_log("User readOne error: " . $e->getMessage());
            return false;
        }
    }

    // UPDATE - Update user profile
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET first_name = :first_name, 
                      last_name = :last_name, 
                      username = :username, 
                      email = :email, 
                      profile_photo = :profile_photo 
                  WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->first_name = htmlspecialchars(strip_tags($this->first_name));
            $this->last_name = htmlspecialchars(strip_tags($this->last_name));
            $this->username = htmlspecialchars(strip_tags($this->username));
            $this->email = htmlspecialchars(strip_tags($this->email));

            // Bind parameters
            $stmt->bindParam(":first_name", $this->first_name);
            $stmt->bindParam(":last_name", $this->last_name);
            $stmt->bindParam(":username", $this->username);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":profile_photo", $this->profile_photo);
            $stmt->bindParam(":id", $this->id);

            return $stmt->execute();

        } catch (PDOException $e) {
            error_log("User update error: " . $e->getMessage());
            return false;
        }
    }

    // DELETE - Delete user account
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            return $stmt->execute();

        } catch (PDOException $e) {
            error_log("User delete error: " . $e->getMessage());
            return false;
        }
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id, first_name, last_name, username, email, password, profile_photo 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $this->email);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
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

        } catch (PDOException $e) {
            error_log("User emailExists error: " . $e->getMessage());
            return false;
        }
    }

    // Check if username exists
    public function usernameExists() {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE username = :username 
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":username", $this->username);
            $stmt->execute();

            return $stmt->rowCount() > 0;

        } catch (PDOException $e) {
            error_log("User usernameExists error: " . $e->getMessage());
            return false;
        }
    }
}
?>