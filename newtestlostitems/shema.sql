-- UniConnect Database Schema

CREATE DATABASE IF NOT EXISTS uniconnect;
USE uniconnect;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Modules Table
CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    coefficient INT NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    module_link TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    resources_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_semester (semester),
    INDEX idx_owner (owner_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Module Ratings Table
CREATE TABLE module_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    UNIQUE KEY unique_user_rating (module_id, user_email),
    INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Marketplace Items Table
CREATE TABLE marketplace_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    seller_email VARCHAR(255) NOT NULL,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_seller (seller_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Study Groups Table
CREATE TABLE study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    notes TEXT NOT NULL,
    preferred_times TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Looking for members',
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_module (module_name),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lost and Found Items Table
CREATE TABLE lost_found_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_lost_found DATE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    storage_location VARCHAR(255),
    image_url TEXT,
    status ENUM('lost', 'found') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_contact (contact_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Todos Table
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_user (user_email),
    INDEX idx_due_date (due_date),
    INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample admin user (password: admin123)
INSERT INTO users (first_name, last_name, username, email, password) VALUES
('Admin', 'User', 'admin.user', 'admin.user@ensia.edu.dz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');