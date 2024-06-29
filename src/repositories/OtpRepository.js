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

    async update(optDetails) {
        const { id, is_used } = optDetails;
        await pool.query(
            'UPDATE otp SET  is_used = ? WHERE id = ?',
            [is_used, id]
        );
    }

    async findByUserIdAndOtpCode(user_id, otp_code) {
        const [rows] = await pool.query('SELECT * FROM otp WHERE user_id = ? AND otp_code = ?', [user_id, otp_code]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM otp WHERE id = ?', [id]);
        return rows[0];
    }

}

export default new OtpRepository()