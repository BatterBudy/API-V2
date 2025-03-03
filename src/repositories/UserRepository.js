import pool from '../database.js';
import bcrypt from 'bcryptjs';

class UserRepository {
    async create(userData) {
        const { first_name, last_name, email, phone_number, password, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, 8);

        const [result] = await pool.query(
            'INSERT INTO user (first_name,last_name, email, phone_number, password, role) VALUES (?, ?, ?, ?,?,?)',
            [first_name, last_name, email, phone_number, hashedPassword, role]
        );
        return this.findById(result.insertId);
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        return rows[0];
    }

    async findByPhoneNumber(phone_number) {
        const [rows] = await pool.query('SELECT * FROM user WHERE phone_number = ?', [phone_number]);
        return rows[0];
    }

    async findByEmailOrPhoneNumber(email, phone_number) {
        const [rows] = await pool.query('SELECT * FROM user WHERE email= ? OR phone_number = ?', [email, phone_number]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        return rows[0];
    }

    async update(id, userDetails) {
        const { first_name, last_name, email, phone_number, image, role = 'user' } = userDetails;

        const [result] = await pool.query(
            'UPDATE user SET first_name = ?, last_name = ?, email = ?, phone_number = ?, image = ?, role = ? WHERE id = ?',
            [first_name, last_name, email, phone_number, image, role, id]
        );

        return this.findById(id);
    }
    async save() {
        if (this.id) {
            // Update existing user
            await pool.query(
                'UPDATE user SET username = ?, email = ?, password = ?, role = ? WHERE id = ?',
                [this.username, this.email, this.password, this.role, this.id]
            );
        } else {
            // Insert new user
            const [result] = await pool.query(
                'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)',
                [this.username, this.email, this.password, this.role]
            );
            this.id = result.insertId;
        }
        return this;
    }

}

export default new UserRepository();