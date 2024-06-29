CREATE TABLE IF NOT EXISTS listing(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    interest_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    price double NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
   status ENUM('listed', 'traded') DEFAULT 'listed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)

)