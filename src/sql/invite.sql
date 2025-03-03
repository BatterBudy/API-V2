CREATE TABLE IF NOT EXISTS invite (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    join_code VARCHAR(10) NOT NULL,
    email VARCHAR(150),
    phone_number VARCHAR(15),
    is_used BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (community_id) REFERENCES community(id)
)

INSERT INTO invite (user_id, community_id, join_code, email) VALUES (1, 1, '12345',  'ola@example.com');