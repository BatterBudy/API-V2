import pool from '../database.js';

class CommunityInviteRepository {

    async create(invite) {
        const { user_id, invitee_id, community_id } = invite;

        const [result] = await pool.query(
            "INSERT INTO community_invite (user_id, invitee_id, community_id) VALUES (?, ?, ?)", [user_id, invitee_id, community_id])

        return this.findByUserIdAndInviteeId(user_id, invitee_id);
    }

    async findByUserIdAndInviteeId(user_id, invitee_id) {
        const [rows] = await pool.query('SELECT * FROM community_invite WHERE user_id = ? AND invitee_id = ?', [user_id, invitee_id]);
        return rows[0];
    }

    async findByInviteeIdAndCommunityId(invitee_id, community_id) {
        const [rows] = await pool.query('SELECT * FROM community_invite WHERE invitee_id = ? AND community_id = ?', [invitee_id, community_id]);
        return rows[0];
    }
}

export default new CommunityInviteRepository()