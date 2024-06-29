import pool from '../database.js';

class InviteRepository {
    async create(invite) {
        const { user_id, community_id, join_code } = invite;
        const [result] = await pool.query(
            "INSERT INTO invite (user_id, community_id, join_code) VALUES (?, ?)",
            [user_id, community_id, join_code]
        );
        return this.findByUserIdAndJoinCode(user_id, join_code);
    }

    async findByUserDetails(inviteDetails) {
        const { email, phone_number, join_code } = inviteDetails;

        const [rows] = await pool.query(
            "SELECT * FROM invite WHERE email = ? OR phone_number = ? AND join_code = ?", [email, phone_number, join_code]
        );

        return rows[0];
   }

   async update(inviteDetails) {
       const { id, is_used } = inviteDetails;
       await pool.query(
           "UPDATE invite SET is_used = ? WHERE id = ?",
           [is_used, id]
       );
   }
}

export default new InviteRepository();