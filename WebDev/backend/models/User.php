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

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET first_name=:first_name, 
                      last_name=:last_name, 
                      username=:username, 
                      email=:email, 
                      password=:password";

        $stmt = $this->conn->prepare($query);

        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);

        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, first_name, last_name, username, email, password, profile_photo 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
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

    public function updateProfilePhoto($photo_path) {
        $query = "UPDATE " . $this->table_name . " 
                  SET profile_photo = :profile_photo 
                  WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":profile_photo", $photo_path);
        $stmt->bindParam(":email", $this->email);

        return $stmt->execute();
    }

    public function getByEmail($email) {
        $this->email = $email;
        return $this->emailExists();
    }
}
?>