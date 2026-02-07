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

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, 
                      category=:category, 
                      description=:description, 
                      location=:location, 
                      date_lost_found=:date_lost_found, 
                      contact_email=:contact_email, 
                      storage_location=:storage_location, 
                      image_url=:image_url, 
                      status=:status";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->contact_email = htmlspecialchars(strip_tags($this->contact_email));
        $this->storage_location = htmlspecialchars(strip_tags($this->storage_location));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":date_lost_found", $this->date_lost_found);
        $stmt->bindParam(":contact_email", $this->contact_email);
        $stmt->bindParam(":storage_location", $this->storage_location);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
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
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE title LIKE :search 
                     OR description LIKE :search 
                     OR location LIKE :search 
                     OR category LIKE :search 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $search_param = "%{$search_term}%";
        $stmt->bindParam(":search", $search_param);
        $stmt->execute();

        return $stmt;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }
}
?>