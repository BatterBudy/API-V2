import CommunityRepository from "../repositories/CommunityRepository.js";
import { validateUser } from "../helpers/userHelpers.js";

class CommunityService {
    async create(user_id, community) {
        const { name, description } = community;

        await validateUser(user_id);
        this.validateCommunityCreated(user_id, name);

        return await CommunityRepository.create({ user_id, name, description });
    }

    async validateCommunityCreated(user_id, community_name) {
        const existingCommunity = await CommunityRepository.findByUserIdAndName(user_id, community_name.toLowerCase());
        if (existingCommunity) {
            throw new Error('Community already exists');
        }
    }
}

export default new CommunityService()