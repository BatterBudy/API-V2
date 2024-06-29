import pool from '../database.js';

class RefreshTokenRepository {
    async create({ user_id, token }) {
        // Implement this method to save the refresh token in your database
        const [result] = await pool.query(
            'INSERT INTO refresh_token (user_id,token) VALUES (?, ?)',
            [user_id, token]
        );
        return this.findById(result.insertId);
    }

    async findByToken(token) {
        const [rows] = await pool.query('SELECT * FROM refresh_token WHERE token = ?', [token]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM refresh_token WHERE id = ?', [id]);
        return rows[0];
    }
}

export default new RefreshTokenRepository();
