<?php
class Module {
    private $conn;
    private $table_name = "modules";
    private $ratings_table = "module_ratings";

    public $id;
    public $module_name;
    public $semester;
    public $coefficient;
    public $owner_email;
    public $module_link;
    public $image_url;
    public $description;
    public $resources_count;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET module_name=:module_name, 
                      semester=:semester, 
                      coefficient=:coefficient, 
                      owner_email=:owner_email, 
                      module_link=:module_link, 
                      image_url=:image_url, 
                      description=:description, 
                      resources_count=:resources_count";

        $stmt = $this->conn->prepare($query);

        $this->module_name = htmlspecialchars(strip_tags($this->module_name));
        $this->semester = htmlspecialchars(strip_tags($this->semester));
        $this->owner_email = htmlspecialchars(strip_tags($this->owner_email));
        $this->module_link = htmlspecialchars(strip_tags($this->module_link));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->description = htmlspecialchars(strip_tags($this->description));

        $stmt->bindParam(":module_name", $this->module_name);
        $stmt->bindParam(":semester", $this->semester);
        $stmt->bindParam(":coefficient", $this->coefficient);
        $stmt->bindParam(":owner_email", $this->owner_email);
        $stmt->bindParam(":module_link", $this->module_link);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":resources_count", $this->resources_count);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function readAll() {
        $query = "SELECT m.*, 
                         COALESCE(AVG(r.rating), 0) as average_rating,
                         COUNT(r.id) as rating_count
                  FROM " . $this->table_name . " m
                  LEFT JOIN " . $this->ratings_table . " r ON m.id = r.module_id
                  GROUP BY m.id
                  ORDER BY m.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne() {
        $query = "SELECT m.*, 
                         COALESCE(AVG(r.rating), 0) as average_rating,
                         COUNT(r.id) as rating_count
                  FROM " . $this->table_name . " m
                  LEFT JOIN " . $this->ratings_table . " r ON m.id = r.module_id
                  WHERE m.id = :id
                  GROUP BY m.id
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

    public function addRating($user_email, $rating) {
        // Check if user already rated
        $check_query = "SELECT id FROM " . $this->ratings_table . " 
                       WHERE module_id = :module_id AND user_email = :user_email";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":module_id", $this->id);
        $check_stmt->bindParam(":user_email", $user_email);
        $check_stmt->execute();

        if($check_stmt->rowCount() > 0) {
            // Update existing rating
            $query = "UPDATE " . $this->ratings_table . " 
                     SET rating = :rating 
                     WHERE module_id = :module_id AND user_email = :user_email";
        } else {
            // Insert new rating
            $query = "INSERT INTO " . $this->ratings_table . " 
                     SET module_id = :module_id, 
                         user_email = :user_email, 
                         rating = :rating";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":module_id", $this->id);
        $stmt->bindParam(":user_email", $user_email);
        $stmt->bindParam(":rating", $rating);

        return $stmt->execute();
    }
}
?>