<?php
class MarketplaceItem {
    private $conn;
    private $table_name = "marketplace_items";

    public $id;
    public $title;
    public $description;
    public $price;
    public $image_url;
    public $seller_email;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, 
                      description=:description, 
                      price=:price, 
                      image_url=:image_url, 
                      seller_email=:seller_email, 
                      status=:status";

        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->seller_email = htmlspecialchars(strip_tags($this->seller_email));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":seller_email", $this->seller_email);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE status = 'available' 
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

    public function updateStatus($new_status) {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $new_status);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    public function search($search_term) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE (title LIKE :search OR description LIKE :search) 
                  AND status = 'available' 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $search_param = "%{$search_term}%";
        $stmt->bindParam(":search", $search_param);
        $stmt->execute();

        return $stmt;
    }
}
?>