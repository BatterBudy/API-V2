import pool from '../database.js';

class OtpRepository {
    async create(optDetails) {
        const { user_id, otp_code } = optDetails;

        const [result] = await pool.query(
            'INSERT INTO otp (user_id, otp_code) VALUES (?, ?)',
            [user_id, otp_code]
        );
        return this.findById(result.insertId);
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM otp WHERE id = ?', [id]);
        return rows[0];
    }

}

export default new OtpRepository()