import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import OptRepository from '../repositories/OtpRepository.js'
import { generateOTP } from '../utils/otpHelper.js'

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
            // Generate OTP
            const otpCode = generateOTP(); // Example function to generate OTP
            //  const otpCode = "qwerty";
            const otpDetails = { user_id: user.id, otp_code: otpCode };
            await OptRepository.create(otpDetails);
        }
        // Destructure user and omit the password field
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    async login(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(user);
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