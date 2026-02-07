<?php
class LostFoundItem {
    private $conn;
    private $table_name = "lost_found_items";

    public $id;
    public $title;
    public $category;
    public $description;
    public $location;
    public $date_lost_found;
    public $contact_email;
    public $storage_location;
    public $image_url;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        if (!$db) {
            throw new Exception('Database connection is required');
        }
        $this->conn = $db;
    }

    public function create() {
        try {
            // SIMPLIFIED: Skip validation for now
            $query = "INSERT INTO " . $this->table_name . " 
                      (title, category, description, location, date_lost_found, contact_email, storage_location, image_url, status) 
                      VALUES 
                      (:title, :category, :description, :location, :date_lost_found, :contact_email, :storage_location, :image_url, :status)";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":category", $this->category);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":location", $this->location);
            $stmt->bindParam(":date_lost_found", $this->date_lost_found);
            $stmt->bindParam(":contact_email", $this->contact_email);
            $stmt->bindParam(":storage_location", $this->storage_location);
            $stmt->bindParam(":image_url", $this->image_url);
            $stmt->bindParam(":status", $this->status);

            // Execute and get result
            $result = $stmt->execute();
            
            if ($result) {
                $this->id = $this->conn->lastInsertId();
                return true;
            } else {
                // Get error info
                $error = $stmt->errorInfo();
                throw new Exception("SQL Error: " . $error[2]);
            }
            
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function readByStatus($status) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE status = :status 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->execute();

        return $stmt;
    }

    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function search($search_term) {
        if (empty($search_term)) {
            return $this->readAll();
        }

        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE title LIKE :search 
                     OR description LIKE :search 
                     OR location LIKE :search 
                     OR category LIKE :search 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $search_param = "%" . $search_term . "%";
        $stmt->bindParam(":search", $search_param);
        $stmt->execute();

        return $stmt;
    }

    public function delete() {
        if (empty($this->id)) {
            throw new Exception("Item ID is required for deletion");
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    public function update() {
        if (empty($this->id)) {
            throw new Exception("Item ID is required for update");
        }

        $query = "UPDATE " . $this->table_name . " 
                  SET title=:title, 
                      category=:category, 
                      description=:description, 
                      location=:location, 
                      date_lost_found=:date_lost_found, 
                      contact_email=:contact_email, 
                      storage_location=:storage_location, 
                      image_url=:image_url, 
                      status=:status,
                      updated_at=NOW()
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":date_lost_found", $this->date_lost_found);
        $stmt->bindParam(":contact_email", $this->contact_email);
        $stmt->bindParam(":storage_location", $this->storage_location);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":status", $this->status);

        return $stmt->execute();
    }
}
?>