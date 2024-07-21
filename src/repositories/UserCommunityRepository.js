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

    async findByUserIdAndCommunityId(user_id, community_id) {
        const [rows] = await pool.query('SELECT * FROM user_community WHERE user_id = ? AND community_id = ?', [user_id, community_id]);
        return rows[0];
    }

    async findByUserId(user_id) {
        //get user user_communities by user_id, join with communities table
        const [rows] = await pool.query(`SELECT uc.*, c.* FROM user_community uc
        JOIN community c ON uc.community_id = c.id
        WHERE uc.user_id = ?`, [user_id]);

        return rows;
    }
}

export default new UserCommunityRepository()