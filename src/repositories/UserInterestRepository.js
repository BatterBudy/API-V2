import pool from '../database.js';

class UserInterestRepository {

    async findAll() {
        const [rows] = await pool.query('SELECT * FROM user_interest');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM user_interest WHERE id = ?', [id]);
        return rows[0];
    }

    async create(user_interest) {
        var { user_id, interest_id } = user_interest;
        const [result] = await pool.query(
            'INSERT INTO user_interest (user_id, interest_id) VALUES (?, ?)',
            [user_id, interest_id]
        );
        return this.findById(result.insertId);
    }

    async findByUserIdAndInterestId(user_id, interest_id) {
        const [rows] = await pool.query('SELECT * FROM user_interest WHERE user_id = ? AND interest_id = ?', [user_id, interest_id]);
        return rows[0];
    }

    async findAllByUserId(user_id) {
        const [rows] = await pool.query('SELECT * FROM user_interest WHERE user_id = ?', [user_id]);
        return rows;
    }




}

export default new UserInterestRepository();