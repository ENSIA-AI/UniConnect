<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

class Database {
    private $host = 'localhost';
    private $db_name = 'uniconnect';
    private $db_user = 'root';
    private $db_pass = '';
    private $port = 3308;
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' . $this->db_name . ';charset=utf8mb4';
            $this->conn = new PDO(
                $dsn,
                $this->db_user,
                $this->db_pass
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die('DB connection failed: ' . $e->getMessage());
        }

        return $this->conn;
    }

    public function getConnection() {
        if ($this->conn === null) {
            $this->connect();
        }
        return $this->conn;
    }
}
?>