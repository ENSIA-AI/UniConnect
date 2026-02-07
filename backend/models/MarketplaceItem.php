<?php
class MarketplaceItem {
    private $conn;
    private $table_name = "marketplace_items";

    public $id,$title,$description,$price,$image_url,$seller_email,$status,$created_at;

    public function __construct($db){ $this->conn = $db; }

    public function create() {
        $query = "INSERT INTO {$this->table_name} 
                  SET title=:title,description=:description,price=:price,image_url=:image_url,
                      seller_email=:seller_email,status=:status,created_at=NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":title",$this->title);
        $stmt->bindParam(":description",$this->description);
        $stmt->bindParam(":price",$this->price);
        $stmt->bindParam(":image_url",$this->image_url);
        $stmt->bindParam(":seller_email",$this->seller_email);
        $stmt->bindParam(":status",$this->status);

        if($stmt->execute()){$this->id=$this->conn->lastInsertId();return true;}
        return false;
    }

    public function readAll(){ 
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table_name} WHERE status IN ('available','reserved') ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt;
    }

    public function readOne(){
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table_name} WHERE id=:id LIMIT 1");
        $stmt->bindParam(":id",$this->id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
    }

    public function update() {
        $stmt = $this->conn->prepare("UPDATE {$this->table_name} SET title=:title,description=:description,price=:price,image_url=:image_url,status=:status WHERE id=:id");
        $stmt->bindParam(":title",$this->title);
        $stmt->bindParam(":description",$this->description);
        $stmt->bindParam(":price",$this->price);
        $stmt->bindParam(":image_url",$this->image_url);
        $stmt->bindParam(":status",$this->status);
        $stmt->bindParam(":id",$this->id);
        return $stmt->execute();
    }

    public function delete() {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table_name} WHERE id=:id");
        $stmt->bindParam(":id",$this->id);
        return $stmt->execute();
    }

    public function search($term){
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table_name} WHERE (title LIKE :search OR description LIKE :search) AND status IN ('available','reserved') ORDER BY created_at DESC");
        $search_param = "%{$term}%";
        $stmt->bindParam(":search",$search_param);
        $stmt->execute();
        return $stmt;
    }
}
?>
