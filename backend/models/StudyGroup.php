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
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // CREATE
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
            (module_name, contact_email, contact_phone, notes, preferred_times, status, user_id)
            VALUES
            (:module_name, :contact_email, :contact_phone, :notes, :preferred_times, :status, :user_id)";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":module_name", $this->module_name);
        $stmt->bindParam(":contact_email", $this->contact_email);
        $stmt->bindParam(":contact_phone", $this->contact_phone);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":preferred_times", $this->preferred_times);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":user_id", $this->user_id);

        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Create error: " . $e->getMessage());
            return false;
        }
    }

    // READ ALL
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE status = 'active' 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ ONE - Returns statement for fetching
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }

    // SEARCH
    public function search($term) {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE (module_name LIKE :term OR notes LIKE :term OR contact_email LIKE :term)
                  AND status = 'active'
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $searchTerm = "%" . $term . "%";
        $stmt->bindParam(":term", $searchTerm);
        $stmt->execute();
        return $stmt;
    }

    // UPDATE
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET module_name = :module_name,
                      contact_email = :contact_email,
                      contact_phone = :contact_phone,
                      notes = :notes,
                      preferred_times = :preferred_times,
                      status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":module_name", $this->module_name);
        $stmt->bindParam(":contact_email", $this->contact_email);
        $stmt->bindParam(":contact_phone", $this->contact_phone);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":preferred_times", $this->preferred_times);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Update error: " . $e->getMessage());
            return false;
        }
    }

    // DELETE
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        
        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Delete error: " . $e->getMessage());
            return false;
        }
    }
}
?>