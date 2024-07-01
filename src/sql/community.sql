CREATE TABLE IF NOT EXISTS community (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    name varchar(150) UNIQUE NOT NULL,
    description TEXT(1000),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)

INSERT INTO community (user_id, name, description) VALUES (1, 'My community', 'My community description');