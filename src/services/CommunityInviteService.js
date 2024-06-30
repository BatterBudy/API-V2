import CommunityInviteRepository from "../repositories/CommunityInviteRepository.js";
import InviteRepository from "../repositories/InviteRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import { generateOTP } from "../utils/otpHelper.js";
import { validateUser } from "../helpers/userHelpers.js";


class CommunityInviteService {


    async create(user_id, invitation) {
        const { email, phone_number, community_id } = invitation;

        await validateUser(user_id);
        const existingUser = await UserRepository.findByEmailOrPhoneNumber(email, phone_number);

        if (existingUser) {
            return await this.inviteExistingUser(existingUser.id, user_id, community_id);
        } else {
            return await this.inviteNewUser(user_id, email, phone_number, community_id);
        }
    }

    async inviteExistingUser(existingUserId, inviterId, communityId) {
        const alreadyInvited = await CommunityInviteRepository.findByInviteeIdAndCommunityId(existingUserId, communityId);
        if (alreadyInvited) {
            throw new Error('User was already invited');
        }

        const invitationDetails = { user_id: inviterId, community_id: communityId, invitee_id: existingUserId };
        await CommunityInviteRepository.create(invitationDetails);
        return { success: true, message: 'Existing user invited successfully' };
    }

    async inviteNewUser(inviterId, email, phone_number, communityId) {
        const alreadyInvited = await InviteRepository.findByUserDetailsWithoutJoinCode({ email, phone_number });
        if (alreadyInvited) {
            throw new Error('User was already invited');
        }

        const join_code = generateOTP();
        const inviteDetails = { email, phone_number, community_id: communityId, join_code };
        await InviteRepository.create(inviterId, inviteDetails);
        return { success: true, message: 'New user invited successfully' };
    }
}

export default new CommunityInviteService()