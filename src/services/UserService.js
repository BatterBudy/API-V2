import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import OptRepository from '../repositories/OtpRepository.js'
import { generateOTP } from '../utils/otpHelper.js'
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import ms from 'ms';

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

        const user = await UserRepository.create(userData);
        if (user) {

            const otpCode = generateOTP();
            const otpDetails = { user_id: user.id, otp_code: otpCode };
            await OptRepository.create(otpDetails);
            //TODO:  send otp to user
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

        // Update OTP as used
        await OptRepository.update({ id: opt.id, is_used: true });

        return true;
    }

    async getUserProfile(userId) {
        const user = await UserRepository.findById(userId);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
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