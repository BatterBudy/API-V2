import ListingRepository from '../repositories/ListingRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import InterestRepository from '../repositories/InterestRepository.js';
import UserInterestRepository from '../repositories/UserInterestRepository.js';
import UserCommunityRepository from '../repositories/UserCommunityRepository.js';
class ListingService {

    async create(user_id, listing) {
        // Validate user exists
        const { interest_id, community_id } = listing;
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate interest exists
        const interest = await InterestRepository.findById(interest_id);
        if (!interest) {
            throw new Error('Interest not found');
        }

        // Validate that user belong to the community
        const userCommunity = await UserCommunityRepository.findByUserIdAndCommunityId(user_id, community_id);
        if (!userCommunity) {
            throw new Error('User does not belong to the community');
        }

        listing.user_id = user_id;

        return await ListingRepository.create(listing);
    }

    async findByUserId(user_id, limit, offset) {
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
        return await ListingRepository.findByUserId(user_id, limit, offset);
    }

    async getRecommendations(user_id, limit, offset) {
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Get User Interest 
        const user_interests = await UserInterestRepository.findAllByUserId(user_id);
        if (!user_interests.length) {
            throw new Error('User interests not found');
        }

        // Get all interest ids
        const interest_ids = user_interests.map(user_interest => user_interest.interest_id);

        // Get recommendations
        const recommendations = await ListingRepository.getRecommendations(user_id, interest_ids, limit, offset);

        // Process the recommendations
        const processedRecommendations = recommendations.map(row => ({
            listing: {
                id: row.id,
                title: row.title,
                description: row.description,
                image_url: row.image_url,
                condition: row.condition,
                is_traded: row.is_traded,
                is_deleted: row.is_deleted,
                created_at: row.created_at,
                updated_at: row.updated_at,
                interest_id: row.interest_id
            },
            interest: {
                id: row.interest_id,
                name: row.name, // Assuming the interest table has a 'name' column
                // Add any other interest-related fields here
            },
            user: {
                id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                //profile_picture: row.profile_picture
                // Add any other user-related fields here
            }
        }));

        return processedRecommendations;
    }

}
export default new ListingService()