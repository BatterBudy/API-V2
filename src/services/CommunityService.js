import CommunityRepository from "../repositories/CommunityRepository.js";
import { validateUser } from "../helpers/userHelpers.js";

class CommunityService {
    async create(user_id, community) {
        const { name, description } = community;


        // Validate user exists
        await validateUser(user_id);
        // Validate User has not created community with same name
        const existingCommunity = await CommunityRepository.findByUserIdAndName(user_id, name.toLowerCase());
        if (existingCommunity) {
            throw new Error('Community already exists');
        }

        return await CommunityRepository.create({ user_id, name, description });
    }
}

export default new CommunityService()