CREATE TABLE IF NOT EXISTS community_invite (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    invitee_id INT NOT NULL,
    community_id INT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    is_revocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (invitee_id) REFERENCES user(id),
    FOREIGN KEY (community_id) REFERENCES community(id)
)