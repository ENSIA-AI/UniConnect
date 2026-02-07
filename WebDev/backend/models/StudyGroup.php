<?php
class StudyGroup {
    private $conn;
    private $table_name = "study_groups";

    public $id;
    public $module_name;
    public $contact_email;
    public $contact_phone;
    public $notes;
    public $preferred_times;
    public $status;
    public $user_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET module_name=:module_name, 
                      contact_email=:contact_email, 
                      contact_phone=:contact_phone, 
                      notes=:notes, 
                      preferred_times=:preferred_times, 
                      status=:status, 
                      user_id=:user_id";

        $stmt = $this->conn->prepare($query);

        $this->module_name = htmlspecialchars(strip_tags($this->module_name));
        $this->contact_email = htmlspecialchars(strip_tags($this->contact_email));
        $this->contact_phone = htmlspecialchars(strip_tags($this->contact_phone));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->preferred_times = htmlspecialchars(strip_tags($this->preferred_times));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(":module_name", $this->module_name);
        $stmt->bindParam(":contact_email", $this->contact_email);
        $stmt->bindParam(":contact_phone", $this->contact_phone);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":preferred_times", $this->preferred_times);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":user_id", $this->user_id);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function search($search_term) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE module_name LIKE :search OR notes LIKE :search 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $search_param = "%{$search_term}%";
        $stmt->bindParam(":search", $search_param);
        $stmt->execute();

        return $stmt;
    }
}
?>