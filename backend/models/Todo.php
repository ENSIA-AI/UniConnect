<?php
class Todo {
    private $conn;
    private $table_name = "todos";

    public $id;
    public $user_email;
    public $title;
    public $description;
    public $due_date;
    public $completed;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_email=:user_email, 
                      title=:title, 
                      description=:description, 
                      due_date=:due_date, 
                      completed=:completed";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->user_email = htmlspecialchars(strip_tags($this->user_email));

        $stmt->bindParam(":user_email", $this->user_email);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":due_date", $this->due_date);
        $stmt->bindParam(":completed", $this->completed);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function readByUser($user_email) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_email = :user_email 
                  ORDER BY due_date ASC, created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_email", $user_email);
        $stmt->execute();

        return $stmt;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title=:title, 
                      description=:description, 
                      due_date=:due_date, 
                      completed=:completed 
                  WHERE id=:id AND user_email=:user_email";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":due_date", $this->due_date);
        $stmt->bindParam(":completed", $this->completed);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_email", $this->user_email);

        return $stmt->execute();
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = :id AND user_email = :user_email";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_email", $this->user_email);
        
        return $stmt->execute();
    }
}
?>