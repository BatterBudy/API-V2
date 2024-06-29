import pool from '../database.js';

class UserCommunityRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM user_community');
        return rows;
    }

    async create(user_id, community_id) {
        const [rows] = await pool.query('INSERT INTO user_community (user_id, community_id) VALUES (?, ?)', [user_id, community_id]);
        return rows.insertId;
    }
}

export default new UserCommunityRepository()