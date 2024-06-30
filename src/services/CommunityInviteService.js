import CommunityInviteRepository from "../repositories/CommunityInviteRepository.js";
import InviteRepository from "../repositories/InviteRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import { generateOTP } from "../utils/otpHelper.js";
import { validateUser } from "../helpers/userHelpers.js";
import logger from "../utils/logger.js";


class CommunityInviteService {

    async create(user_id, invitation) {
        logger.info(`Creating invitation: ${JSON.stringify(invitation)}`);

        const { email, phone_number, community_id } = invitation;

        await validateUser(user_id);
        const existingUser = await UserRepository.findByEmailOrPhoneNumber(email, phone_number);

        if (existingUser) {
            logger.info(`Inviting existing user: ${existingUser.id}`);
            return await this.inviteExistingUser(existingUser.id, user_id, community_id);
        } else {
            logger.info(`Inviting new user: ${email}, ${phone_number}`);
            return await this.inviteNewUser(user_id, email, phone_number, community_id);
        }
    }

    async inviteExistingUser(existingUserId, inviterId, communityId) {
        const alreadyInvited = await CommunityInviteRepository.findByInviteeIdAndCommunityId(existingUserId, communityId);
        if (alreadyInvited) {
            logger.info(`User ${existingUserId} already invited to community ${communityId}`);
            throw new Error('User was already invited');
        }

        const invitationDetails = { user_id: inviterId, community_id: communityId, invitee_id: existingUserId };
        await CommunityInviteRepository.create(invitationDetails);
        logger.info(`User ${existingUserId} invited to community ${communityId}`);
        return { success: true, message: 'Existing user invited successfully' };
    }

    async inviteNewUser(inviterId, email, phone_number, communityId) {
        const alreadyInvited = await InviteRepository.findByUserDetailsWithoutJoinCode({ email, phone_number });
        if (alreadyInvited) {
            logger.info(`User ${email} already invited to community ${communityId}`);
            throw new Error('User was already invited');
        }

        const join_code = generateOTP();
        const inviteDetails = { email, phone_number, community_id: communityId, join_code };
        await InviteRepository.create(inviterId, inviteDetails);

        logger.info(`User ${email} invited to community ${communityId}`);
        return { success: true, message: 'New user invited successfully' };
    }
}

export default new CommunityInviteService()