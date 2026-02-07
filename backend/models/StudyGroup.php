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
        $query = "INSERT INTO {$this->table_name}
            (module_name, contact_email, contact_phone, notes, preferred_times, status, user_id)
            VALUES (:module_name, :contact_email, :contact_phone, :notes, :preferred_times, :status, :user_id)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ":module_name" => $this->module_name,
            ":contact_email" => $this->contact_email,
            ":contact_phone" => $this->contact_phone,
            ":notes" => $this->notes,
            ":preferred_times" => $this->preferred_times,
            ":status" => $this->status,
            ":user_id" => $this->user_id
        ]);
    }

    public function readAll() {
        return $this->conn->query(
            "SELECT * FROM {$this->table_name} WHERE status='active' ORDER BY created_at DESC"
        );
    }

    public function readOne() {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table_name} WHERE id=:id LIMIT 1"
        );
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function search($term) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table_name}
             WHERE status='active'
             AND (module_name LIKE :t OR notes LIKE :t)"
        );
        $t = "%$term%";
        $stmt->bindParam(":t", $t);
        $stmt->execute();
        return $stmt;
    }

    public function update() {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table_name}
             SET module_name=:module_name, contact_email=:contact_email,
                 contact_phone=:contact_phone, notes=:notes,
                 preferred_times=:preferred_times
             WHERE id=:id"
        );

        return $stmt->execute([
            ":module_name" => $this->module_name,
            ":contact_email" => $this->contact_email,
            ":contact_phone" => $this->contact_phone,
            ":notes" => $this->notes,
            ":preferred_times" => $this->preferred_times,
            ":id" => $this->id
        ]);
    }

    public function delete() {
        $stmt = $this->conn->prepare(
            "DELETE FROM {$this->table_name} WHERE id=:id"
        );
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }
}
