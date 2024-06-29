import pool from '../database.js';

class ListingRepository {
    async create(listing) {
        const { title, description, price, user_id, interest_id } = listing;
        const [result] = await pool.query(
            'INSERT INTO listing (title, description, price, user_id, interest_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, price, user_id, interest_id]
        );
        return this.findById(result.insertId);
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM listing WHERE id = ?', [id]);
        return rows[0];
    }

    async findByUserId(user_id, limit, offset) {
        const [rows] = await pool.query('SELECT * FROM listing WHERE user_id = ? LIMIT ? OFFSET ?', [user_id, limit, offset]);
        return rows;
    }

    async getRecommendations(user_id, interest_ids, limit, offset) {
        // Get listing where user_id != user_id and interest_id in interest_ids and join with interests
        const [rows] = await pool.query(`
            SELECT l.*, i.*, u.*
            FROM listing l 
            JOIN interest i ON l.interest_id = i.id 
            JOIN users u ON l.user_id = u.id
            WHERE l.user_id != ? 
            AND l.interest_id IN (?) 
            AND l.is_deleted = ? 
            AND l.is_traded = ? 
            LIMIT ? OFFSET ?
        `, [user_id, interest_ids, false, false, limit, offset]);
        return rows;
    }

}

export default new ListingRepository()