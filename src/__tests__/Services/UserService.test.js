import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserService from './../../services/UserService';
import UserRepository from '../../repositories/UserRepository';
import OptRepository from '../../repositories/OtpRepository';
import InviteRepository from '../../repositories/InviteRepository';
import CommunityInviteRepository from '../../repositories/CommunityInviteRepository';
import UserInterestRepository from '../../repositories/UserInterestRepository';
import InterestRepository from '../../repositories/InterestRepository';
import RefreshTokenRepository from '../../repositories/RefreshTokenRepository';
import { generateOTP } from '../../utils/otpHelper';
import { validateUser, cleanUserData } from '../../helpers/userHelpers';

jest.mock('../../repositories/UserRepository');
jest.mock('../../repositories/OtpRepository');
jest.mock('../../repositories/InviteRepository');
jest.mock('../../repositories/CommunityInviteRepository');
jest.mock('../../repositories/UserInterestRepository');
jest.mock('../../repositories/InterestRepository');
jest.mock('../../repositories/RefreshTokenRepository');
jest.mock('../../utils/otpHelper');
jest.mock('../../helpers/userHelpers', () => ({
    validateUser: jest.fn(),
    cleanUserData: jest.fn()
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('ms');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should throw an error if email is already in use', async () => {
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue({ email: 'test@example.com' });

            await expect(UserService.register({ email: 'test@example.com', phone_number: '1234567890' }))
                .rejects
                .toThrow('Email already in use');
        });

        it('should throw an error if phone number is already in use', async () => {
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue({ phone_number: '1234567890' });

            await expect(UserService.register({ email: 'test@example.com', phone_number: '1234567890' }))
                .rejects
                .toThrow('Phone Number already in use');
        });

        it('should throw an error if user was not invited', async () => {
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue(null);
            InviteRepository.findByUserDetails.mockResolvedValue(null);

            await expect(UserService.register({ email: 'test@example.com', phone_number: '1234567890', join_code: 'code' }))
                .rejects
                .toThrow('User was not invited');
        });

        it('should throw an error if invitation code is invalid', async () => {
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue(null);
            InviteRepository.findByUserDetails.mockResolvedValue({ join_code: 'invalid_code' });

            await expect(UserService.register({ email: 'test@example.com', phone_number: '1234567890', join_code: 'code' }))
                .rejects
                .toThrow('Invalid invitation code');
        });

        it('should create user and return cleaned user data', async () => {
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue(null);
            InviteRepository.findByUserDetails.mockResolvedValue({ join_code: 'code', id: 1 });
            UserRepository.create.mockResolvedValue({ id: 1 });
            cleanUserData.mockReturnValue({ id: 1 });

            const result = await UserService.register({ email: 'test@example.com', phone_number: '1234567890', join_code: 'code' });

            expect(result).toEqual({ id: 1 });
            expect(UserRepository.create).toHaveBeenCalledWith({ email: 'test@example.com', phone_number: '1234567890', join_code: 'code' });
        });
    });

    describe('login', () => {
        it('should throw an error if user does not exist', async () => {
            UserRepository.findByEmail.mockResolvedValue(null);

            await expect(UserService.login('test@example.com', 'password'))
                .rejects
                .toThrow('Invalid credentials');
        });

        it('should throw an error if password is invalid', async () => {
            UserRepository.findByEmail.mockResolvedValue({ password: 'hashed_password' });
            bcrypt.compare.mockResolvedValue(false);

            await expect(UserService.login('test@example.com', 'password'))
                .rejects
                .toThrow('Invalid credentials');
        });

        it('should return tokens and user data on successful login', async () => {
            const user = { id: 1, email: 'test@example.com', password: 'hashed_password' };
            UserRepository.findByEmail.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');
            cleanUserData.mockReturnValue({ id: 1, email: 'test@example.com' });

            const result = await UserService.login('test@example.com', 'password');

            expect(result).toEqual({
                accessToken: 'token',
                refreshToken: 'token',
                accessTokenExpiration: expect.any(Date),
                refreshTokenExpiration: expect.any(Date),
                user: { id: 1, email: 'test@example.com' },
            });
            expect(UserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        });
    });

    describe('validateOpt', () => {
        it('should throw an error if OTP is invalid', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(null);

            await expect(UserService.validateOpt({ user_id: 1, otp_code: '123456' }))
                .rejects
                .toThrow('Invalid OTP');
        });

        it('should throw an error if OTP has been used', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue({ is_used: true });

            await expect(UserService.validateOpt({ user_id: 1, otp_code: '123456' }))
                .rejects
                .toThrow('OTP has been used');
        });

        it('should throw an error if OTP has expired', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue({ expires_at: new Date(Date.now() - 10000) });

            await expect(UserService.validateOpt({ user_id: 1, otp_code: '123456' }))
                .rejects
                .toThrow('OTP has expired');
        });

        it('should throw an error if user is not found', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue({ expires_at: new Date(Date.now() + 10000), is_used: false });
            UserRepository.findById.mockResolvedValue(null);

            await expect(UserService.validateOpt({ user_id: 1, otp_code: '123456' }))
                .rejects
                .toThrow('User not found');
        });

        it('should return true on valid OTP', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue({ id: 1, expires_at: new Date(Date.now() + 10000), is_used: false });
            UserRepository.findById.mockResolvedValue({ id: 1 });

            const result = await UserService.validateOpt({ user_id: 1, otp_code: '123456' });

            expect(result).toBe(true);
            expect(OptRepository.update).toHaveBeenCalledWith({ id: 1, is_used: true });
        });
    });

    describe('addUserInterest', () => {
        it('should throw an error if user is not found', async () => {
            UserRepository.findById.mockResolvedValue(null);

            await expect(UserService.addUserInterest({ user_id: 1, interest_id: 1 }))
                .rejects
                .toThrow('User not found');
        });

        it('should throw an error if interest is not found', async () => {
            UserRepository.findById.mockResolvedValue({ id: 1 });
            InterestRepository.findById.mockResolvedValue(null);

            await expect(UserService.addUserInterest({ user_id: 1, interest_id: 1 }))
                .rejects
                .toThrow('Interest not found');
        });

        it('should throw an error if user has already added this interest', async () => {
            UserRepository.findById.mockResolvedValue({ id: 1 });
            InterestRepository.findById.mockResolvedValue({ id: 1 });
            UserInterestRepository.findByUserIdAndInterestId.mockResolvedValue({ id: 1 });

            await expect(UserService.addUserInterest({ user_id: 1, interest_id: 1 }))
                .rejects
                .toThrow('User has already added this interest');
        });

        it('should add user interest and return it', async () => {
            UserRepository.findById.mockResolvedValue({ id: 1 });
            InterestRepository.findById.mockResolvedValue({ id: 1 });
            UserInterestRepository.findByUserIdAndInterestId.mockResolvedValue(null);
            UserInterestRepository.create.mockResolvedValue({ id: 1, user_id: 1, interest_id: 1 });

            const result = await UserService.addUserInterest({ user_id: 1, interest_id: 1 });

            expect(result).toEqual({ id: 1, user_id: 1, interest_id: 1 });
            expect(UserInterestRepository.create).toHaveBeenCalledWith({ user_id: 1, interest_id: 1 });
        });
    });

  
});
