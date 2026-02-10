/*Database creation*/
CREATE DATABASE IF NOT EXISTS Moolah_DB;
USE Moolah_DB;

/*Assure character compatibility*/
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
/*Set user permissions*/
CREATE USER IF NOT EXISTS 'moolah_user'@'localhost' IDENTIFIED BY 'securepassword12026';
GRANT ALL PRIVILEGES ON Moolah_DB.* TO 'moolah_user'@'localhost';
FLUSH PRIVILEGES;

/*Table creation*/
/*Users table*/
CREATE TABLE IF NOT EXISTS Users(
user_id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_email (email),
 INDEX idx_username (username)   
);

/*Membership table*/
CREATE TABLE IF NOT EXISTS Membership(
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    membership_type ENUM('free', 'premium') NOT NULL DEFAULT 'free',
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_membership (user_id, membership_type) );


/*Categories table*/
CREATE TABLE IF NOT EXISTS Categories(
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    category_type ENUM('income', 'expense', 'savings') NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    UNIQUE KEY unique_category (category_name, category_type));
    
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, description VARCHAR(255), type ENUM('income', 'expense', 'savings') NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    INDEX idx_user_date (user_id, date),
    INDEX idx_user_type (user_id, type),
    INDEX idx_date (date) );

CREATE TABLE IF NOT EXISTS Budgets(
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    budget_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active), UNIQUE KEY unique_user_budget (user_id, budget_name) );

CREATE TABLE IF NOT EXISTS Goals(
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0.00,
    target_date DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id) );