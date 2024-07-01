import ListingRepository from '../../repositories/ListingRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import InterestRepository from '../../repositories/InterestRepository.js';
import UserInterestRepository from '../../repositories/UserInterestRepository.js';
import UserCommunityRepository from '../../repositories/UserCommunityRepository.js';
import { validateUser } from '../../helpers/userHelpers.js';
import ListingService from '../../services/ListingService.js';

jest.mock('../../repositories/ListingRepository.js');
jest.mock('../../repositories/UserRepository.js');
jest.mock('../../repositories/InterestRepository.js');
jest.mock('../../repositories/UserInterestRepository.js');
jest.mock('../../repositories/UserCommunityRepository.js');
jest.mock('../../helpers/userHelpers.js');

describe('ListingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a listing if all validations pass', async () => {
            const user_id = 1;
            const listing = { interest_id: 1, community_id: 1 };

            validateUser.mockReturnValueOnce(true);
            InterestRepository.findById.mockResolvedValueOnce({ id: 1 });
            UserCommunityRepository.findByUserIdAndCommunityId.mockResolvedValueOnce({ user_id, community_id: 1 });
            ListingRepository.create.mockResolvedValueOnce({ id: 1, ...listing, user_id });

            const result = await ListingService.create(user_id, listing);

            expect(validateUser).toHaveBeenCalledWith(user_id);
            expect(InterestRepository.findById).toHaveBeenCalledWith(1);
            expect(UserCommunityRepository.findByUserIdAndCommunityId).toHaveBeenCalledWith(user_id, 1);
            expect(ListingRepository.create).toHaveBeenCalledWith({ ...listing, user_id });
            expect(result).toEqual({ id: 1, ...listing, user_id });
        });

        it('should throw an error if interest is not found', async () => {
            const user_id = 1;
            const listing = { interest_id: 1, community_id: 1 };

            validateUser.mockReturnValueOnce(true);
            InterestRepository.findById.mockResolvedValueOnce(null);

            await expect(ListingService.create(user_id, listing)).rejects.toThrow('Interest not found');
            expect(validateUser).toHaveBeenCalledWith(user_id);
            expect(InterestRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw an error if user does not belong to the community', async () => {
            const user_id = 1;
            const listing = { interest_id: 1, community_id: 1 };

            validateUser.mockReturnValueOnce(true);
            InterestRepository.findById.mockResolvedValueOnce({ id: 1 });
            UserCommunityRepository.findByUserIdAndCommunityId.mockResolvedValueOnce(null);

            await expect(ListingService.create(user_id, listing)).rejects.toThrow('User does not belong to the community');
            expect(validateUser).toHaveBeenCalledWith(user_id);
            expect(InterestRepository.findById).toHaveBeenCalledWith(1);
            expect(UserCommunityRepository.findByUserIdAndCommunityId).toHaveBeenCalledWith(user_id, 1);
        });
    });

    describe('findByUserId', () => {
        it('should return listings for a valid user', async () => {
            const user_id = 1;
            const limit = 10;
            const offset = 0;
            const listings = [{ id: 1, title: 'Listing 1' }];

            UserRepository.findById.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
            ListingRepository.findByUserId.mockResolvedValueOnce(listings);

            const result = await ListingService.findByUserId(user_id, limit, offset);

            expect(UserRepository.findById).toHaveBeenCalledWith(user_id);
            expect(ListingRepository.findByUserId).toHaveBeenCalledWith(user_id, limit, offset);
            expect(result).toEqual(listings);
        });

        it('should throw an error if user is not found', async () => {
            const user_id = 1;
            const limit = 10;
            const offset = 0;

            UserRepository.findById.mockResolvedValueOnce(null);

            await expect(ListingService.findByUserId(user_id, limit, offset)).rejects.toThrow('User not found');
            expect(UserRepository.findById).toHaveBeenCalledWith(user_id);
        });
    });

    describe('getRecommendations', () => {
        it('should return recommendations for a valid user with interests', async () => {
            const user_id = 1;
            const limit = 10;
            const offset = 0;
            const user_interests = [{ interest_id: 1 }];
            const recommendations = [{
                id: 1,
                title: 'Listing 1',
                description: 'Description 1',
                image_url: 'http://example.com/image1.jpg',
                condition: 'new',
                is_traded: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
                interest_id: 1,
                name: 'Interest 1',
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com'
            }];

            UserRepository.findById.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
            UserInterestRepository.findAllByUserId.mockResolvedValueOnce(user_interests);
            ListingRepository.getRecommendations.mockResolvedValueOnce(recommendations);

            const result = await ListingService.getRecommendations(user_id, limit, offset);

            expect(UserRepository.findById).toHaveBeenCalledWith(user_id);
            expect(UserInterestRepository.findAllByUserId).toHaveBeenCalledWith(user_id);
            expect(ListingRepository.getRecommendations).toHaveBeenCalledWith(user_id, [1], limit, offset);
            expect(result).toEqual(recommendations.map(row => ({
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
                    name: row.name,
                },
                user: {
                    id: row.user_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email: row.email,
                }
            })));
        });

        it('should throw an error if user is not found', async () => {
            const user_id = 1;
            const limit = 10;
            const offset = 0;

            UserRepository.findById.mockResolvedValueOnce(null);

            await expect(ListingService.getRecommendations(user_id, limit, offset)).rejects.toThrow('User not found');
            expect(UserRepository.findById).toHaveBeenCalledWith(user_id);
        });

        it('should throw an error if user has no interests', async () => {
            const user_id = 1;
            const limit = 10;
            const offset = 0;

            UserRepository.findById.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
            UserInterestRepository.findAllByUserId.mockResolvedValueOnce([]);

            await expect(ListingService.getRecommendations(user_id, limit, offset)).rejects.toThrow('User interests not found');
            expect(UserRepository.findById).toHaveBeenCalledWith(user_id);
            expect(UserInterestRepository.findAllByUserId).toHaveBeenCalledWith(user_id);
        });
    });
});
