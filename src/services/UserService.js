import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/UserRepository.js';
import OptRepository from '../repositories/OtpRepository.js'
import { generateOTP } from '../utils/otpHelper.js'
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import ms from 'ms';
import UserInterestRepository from '../repositories/UserInterestRepository.js';
import InterestRepository from '../repositories/InterestRepository.js';
import InviteRepository from '../repositories/InviteRepository.js';
import CommunityInviteRepository from '../repositories/CommunityInviteRepository.js';
import { cleanUserData, validateUser } from '../helpers/userHelpers.js';
import ListingRepository from '../repositories/ListingRepository.js';
import { uploadFile } from '../utils/fileUploadService.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

class UserService {
    async register(userData) {

        await this.checkUserExistence(userData);
        const invitedUser = await this.verifyInvitation(userData);

        const user = await UserRepository.create(userData);
        if (user) {
            await this.updateInvite(invitedUser);
            await this.moveInvitationToCommunityInvite(invitedUser, user.id);
            await this.generateAndSendOTP(user.id);
        }

        return await cleanUserData(user);
    }

    async login(email, password, remember_me = false) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        //TODO: Add check if user is verified
        return await this.generateUserTokens(user, remember_me);
    }

    async refreshToken(refreshToken) {
        const user = await this.verifyRefreshToken(refreshToken);

        return await this.generateUserTokens(user);
    }

    async verifyRefreshToken(token) {
        console.log(token);

        try {
            const { user_id } = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const user = await validateUser(user_id);

            console.log(user);

            return user;
        } catch (error) {
            console.log(error);
            throw new Error('Invalid refresh token');
        }
    }

    async generateUserTokens(user, remember_me = false) {
        try {

            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Save refresh token in the database
            await this.saveRefreshToken(user.id, refreshToken);

            const expiresIn = remember_me ? '30d' : '1h';
            const accessTokenExpiration = new Date(Date.now() + ms(expiresIn));
            const refreshTokenExpiration = new Date(Date.now() + ms('30d'));

            const cleanUser = await cleanUserData(user);
            const auth = { accessToken, refreshToken, accessTokenExpiration, refreshTokenExpiration };

            return {
                auth: auth,
                user: cleanUser,
            };

        } catch (error) {
            throw new Error(error);
        }
    }
    async checkUserExistence(userData) {


        const existingUser = await UserRepository.findByEmailOrPhoneNumber(userData.email, userData.phone_number);

        if (existingUser?.email === userData.email) {
            throw new Error('Email already in use');
        }

        if (existingUser?.phone_number === userData.phone_number) {
            throw new Error('Phone Number already in use');
        }
    }

    async verifyInvitation(userData) {
        const inviteDetails = {
            email: userData.email,
            phone_number: userData.phone_number,
            join_code: userData.join_code
        };
        const invitedUser = await InviteRepository.findByUserDetails(inviteDetails);
        if (!invitedUser) {
            throw new Error('User was not invited');
        }

        if (invitedUser.join_code !== userData.join_code) {
            throw new Error('Invalid invitation code');
        }
        return invitedUser;
    }

    async updateInvite(invitedUser) {
        const inviteUpdateDetails = { id: invitedUser.id, is_used: true };
        await InviteRepository.update(inviteUpdateDetails);
    }

    async moveInvitationToCommunityInvite(invitedUser, user_id) {
        await CommunityInviteRepository.create({
            user_id: invitedUser.user_id,
            invitee_id: user_id,
            community_id: invitedUser.community_id
        });
    }

    async generateAndSendOTP(user_id) {
        const otpCode = generateOTP();
        const otpDetails = { user_id: user_id, otp_code: otpCode };
        await OptRepository.create(otpDetails);
        // TODO: send otp to user
    }




    async validateOpt(otpDetails) {
        const { user_id, otp_code } = otpDetails;

        const opt = await OptRepository.findByUserIdAndOtpCode(user_id, otp_code);
        if (!opt) {
            throw new Error('Invalid OTP');
        }

        //Validate that OTP has not been used
        if (opt.is_used) {
            throw new Error('OTP has been used');
        }

        //Validate that OTP has not expired
        const otpExpiration = new Date(opt.expires_at);
        if (otpExpiration < new Date()) {
            throw new Error('OTP has expired');
        }

        // Get user details
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Update OTP as used
        await OptRepository.update({ id: opt.id, is_used: true });

        return true;
    }

    async getUserProfile(user_id) {

        console.log("UserService.getUserProfile", user_id);

        const user = await validateUser(user_id);

        console.log(user);

        // Get user details
        //get user listing
        const listing_count = 0;
        const batter_count = { total: 0, successful: 0, failed: 0 };
        const interest_count = 0;
        const recent_listings = {};
        const communities = {};

        const cleanUser = await cleanUserData(user);

        const result = {
            listing_count,
            batter_count,
            interest_count,
            recent_listings,
            communities,
            user: cleanUser
        };

        return result;
    }


    async uploadProfilePicture(user_id, file) {
        var user = await validateUser(user_id);
        const profile_picture = await uploadFile('images', file);
        console.log(profile_picture);
        if (!profile_picture) {
            throw new Error('Profile picture upload failed');
        }

        //Add image to user object
        user.image = profile_picture;

        console.log(user);

        const updated_user = await UserRepository.update(user.id, user);
        console.log(updated_user);

        return await cleanUserData(updated_user);
    }
    async addUserInterest({ user_id, interest_id }) {
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        //CHeck that the Interest Exists
        const interestExist = await InterestRepository.findById(interest_id);
        if (!interestExist) {
            throw new Error('Interest not found');
        }

        //Check that the user has not already added the interest
        const userInterest = await UserInterestRepository.findByUserIdAndInterestId(user_id, interest_id);
        if (userInterest) {
            throw new Error('User has already added this interest');
        }

        const newInterest = await UserInterestRepository.create({ user_id, interest_id });
        return newInterest;
    }

    async getUserInterests(user_id) {
        const user = await UserRepository.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
        const userInterests = await UserInterestRepository.findAllByUserId(user_id);
        return userInterests;
    }

    generateAccessToken(user) {
        return jwt.sign(
            { user_id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            { user_id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        );
    }

    async saveRefreshToken(user_id, refreshToken) {
        await RefreshTokenRepository.create({ user_id: user_id, token: refreshToken });
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }


}

export default new UserService();