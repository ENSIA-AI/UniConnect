<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

class Database {
    private $conn;

    public function getConnection() {
        try {
            $this->conn = new PDO(
                "mysql:host=localhost;dbname=uniconnect;charset=utf8mb4",
                "root",
                ""
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("DB connection failed: " . $e->getMessage());
        }
        return $this->conn;
    }
}