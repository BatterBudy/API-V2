import pool from '../database.js';

class ListingRepository {
    async create(listing) {
        const { title, description, price, user_id, interest_id, community_id } = listing;
        const [result] = await pool.query(
            'INSERT INTO listing (title, description, price, user_id, interest_id, community_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, price, user_id, interest_id, community_id]
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

    async addListingImages(listing_id, images) {
        const [rows] = await pool.query('INSERT INTO listing_images (listing_id, listing_image) VALUES ?', [images.map(image => [listing_id, image])]);
        return rows;
    }

    async getRecommendations(user_id, interest_ids, limit, offset) {
        // Get listing where user_id != user_id and interest_id in interest_ids and join with interests
        const [rows] = await pool.query(`
            SELECT l.*, i.*, u.*, uc.community_id
            FROM listing l 
            JOIN interest i ON l.interest_id = i.id 
            JOIN user u ON l.user_id = u.id
            JOIN user_community uc ON l.community_id = uc.community_id
           WHERE l.user_id != ? 
            AND  l.interest_id IN (?) 
            AND l.is_deleted = ? 
            AND l.status != ? 
            AND uc.user_id = ?
            LIMIT ? OFFSET ?
        `, [user_id, interest_ids, false, 'traded', user_id, limit, offset]);
        return rows;
    }

}

export default new ListingRepository()