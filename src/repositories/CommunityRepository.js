import pool from "../database.js";

class CommunityRepository {
    async create({ user_id, name, description }) {
        const [result] = await pool.query(
            'INSERT INTO community (user_id, name, description) VALUES (?, ?,?)',
            [user_id, name.toLowerCase(), description]
        );
        return result.insertId;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM community WHERE id = ?', [id]);
        return rows[0];
    }
    async findByUserId(user_id) {
        const [rows] = await pool.query('SELECT * FROM community WHERE user_id = ?', [user_id]);
        return rows;
    }

    async findByUserIdAndName(user_id, name) {
        const [rows] = await pool.query('SELECT * FROM community WHERE user_id = ? AND name = ?', [user_id, name]);
        return rows[0];
    }

}

export default new CommunityRepository()