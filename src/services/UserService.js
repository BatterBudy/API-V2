import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import OptRepository from '../repositories/OtpRepository.js'
import { generateOTP } from '../utils/otpHelper.js'
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import ms from 'ms';
import UserInterestRepository from '../repositories/UserInterestRepository.js';
import InterestRepository from '../repositories/InterestRepository.js';
import InviteRepository from '../repositories/InviteRepository.js';
import CommunityInviteRepository from '../repositories/CommunityInviteRepository.js';

//TODO : refresh token
class UserService {
    async register(userData) {
        const existingUser = await UserRepository.findByEmailOrPhoneNumber(userData.email, userData.phone_number);
        if (existingUser?.email === userData.email) {
            throw new Error('Email already in use');
        }

        if (existingUser?.phone_number === userData.phone_number) {
            throw new Error('Phone Number already in use');
        }

        //check if user was invited
        const inviteDetails = { email: userData.email, phone_number: userData.phone_number, join_code: userData.join_code }
        const invited_user = await InviteRepository.findByUserDetails(inviteDetails);

        if (!invited_user) {
            throw new Error('User was not invited');
        }

        const user = await UserRepository.create(userData);
        if (user) {

            const inviteUpdateDetails = { id: invited_user.id, is_used: true };
            await InviteRepository.update(inviteUpdateDetails);

            //Move Invitation to Community Invite
            CommunityInviteRepository.create({ user_id: invited_user.user_id, invitee_id: user.id, community_id: invited_user.community_id });


            //Generate OTP
            const otpCode = generateOTP();
            const otpDetails = { user_id: user.id, otp_code: otpCode };
            await OptRepository.create(otpDetails);

            //TODO : send otp to user.

        }

        // Destructure user and omit the password field
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
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

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Save refresh token in the database
        await this.saveRefreshToken(user.id, refreshToken);

        const expiresIn = remember_me ? '30d' : '1h';
        const accessTokenExpiration = new Date(Date.now() + ms(expiresIn));
        const refreshTokenExpiration = new Date(Date.now() + ms('30d'));

        return {
            accessToken,
            refreshToken,
            accessTokenExpiration,
            refreshTokenExpiration,
            userId: user.id,
            email: user.email
        };
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

    async getUserProfile(userId) {
        const user = await UserRepository.findById(userId);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
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
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            { userId: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        );
    }

    async saveRefreshToken(userId, refreshToken) {
        await RefreshTokenRepository.create({ user_id: userId, token: refreshToken });
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