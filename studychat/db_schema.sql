-- Study Chat Database Schema
-- Create database and tables for the Study Chat application

CREATE DATABASE IF NOT EXISTS studychat_db;
USE studychat_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Rooms table for chat rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INT DEFAULT 50,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert some default study rooms
INSERT INTO rooms (name, subject, description, created_by) VALUES
('General Study Hall', 'General', 'Open discussion for all subjects', 1),
('Mathematics Help', 'Mathematics', 'Get help with math problems and concepts', 1),
('Computer Science', 'CS', 'Programming, algorithms, and CS topics', 1),
('Physics Study Group', 'Physics', 'Physics problems and theory discussions', 1),
('Chemistry Lab', 'Chemistry', 'Chemistry concepts and lab discussions', 1),
('Literature Circle', 'Literature', 'Book discussions and writing help', 1),
('History Forum', 'History', 'Historical events and research discussions', 1);

-- Create a default admin user (password: admin123)
-- Note: In production, this should be created through the registration system
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@studychat.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Update room created_by to reference the admin user
UPDATE rooms SET created_by = 1 WHERE created_by = 1;
