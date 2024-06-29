import UserService from '../services/UserService';
import UserRepository from '../repositories/UserRepository';
import OptRepository from '../repositories/OtpRepository'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/otpHelper';

jest.mock('../repositories/UserRepository');
jest.mock('../repositories/OtpRepository');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/otpHelper'); // Mock the entire utils module


describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {

        it('should create a new user and return user without password', async () => {
            const userData = { email: 'test@example.com', phone_number: '0090980980808', password: 'password123' };
            const createdUser = {
                id: 1,
                first_name: 'Test',
                last_name: 'User',
                email: userData.email,
                phone_number: userData.phone_number,
                role: 'user',
                is_active: 1,
                is_deleted: 0,
                is_confirmed: 0,
                created_at: new Date(),
                updated_at: new Date(),
                password: userData.password
            };

            // Mock UserRepository methods
            UserRepository.findByEmailOrPhoneNumber = jest.fn().mockResolvedValue(null);
            UserRepository.create = jest.fn().mockResolvedValue(createdUser);

            // Mock OTP generation and creation
            const mockOTP = '123456'; // Example OTP code
            generateOTP.mockReturnValue(mockOTP); // Mock generateOTP function

            const mockOTPDetails = { user_id: createdUser.id, otp_code: mockOTP };
            OptRepository.create = jest.fn().mockResolvedValue(mockOTPDetails);

            const result = await UserService.register(userData);

            // Expectations
            expect(UserRepository.findByEmailOrPhoneNumber).toHaveBeenCalledWith(userData.email, userData.phone_number);
            expect(UserRepository.create).toHaveBeenCalledWith(userData);
            expect(OptRepository.create).toHaveBeenCalledWith(mockOTPDetails);

            // Check that the returned user information (without password) is correct
            expect(result).toEqual({
                id: 1,
                first_name: 'Test',
                last_name: 'User',
                email: userData.email,
                phone_number: userData.phone_number,
                role: 'user',
                is_active: 1,
                is_deleted: 0,
                is_confirmed: 0,
                created_at: expect.any(Date),
                updated_at: expect.any(Date)
            });
        });


        it('should throw an error if email is already in use', async () => {
            const userData = { email: 'existing@example.com', phone_number: '1234567890', password: 'password123' };
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue({ id: 1, email: userData.email });

            await expect(UserService.register(userData)).rejects.toThrow('Email already in use');
        });

        it('should throw an error if phone number is already in use', async () => {
            const userData = { email: 'new@example.com', phone_number: '1234567890', password: 'password123' };
            UserRepository.findByEmailOrPhoneNumber.mockResolvedValue({ id: 1, phone_number: userData.phone_number });

            await expect(UserService.register(userData)).rejects.toThrow('Phone Number already in use');
        });

    });

    describe('login', () => {
        it('should return tokens and user info for valid credentials', async () => {
            const loginData = { email: 'user@example.com', password: 'password123' };
            const foundUser = { id: 1, ...loginData, password: 'hashed_password' };
            const rememberMe = false;

            // Mock dependencies
            UserRepository.findByEmail.mockResolvedValue(foundUser);
            bcrypt.compare.mockResolvedValue(true);

            let accessToken, refreshToken;
            jwt.sign.mockImplementation((payload, secret, options) => {
                if (secret === process.env.JWT_SECRET) {
                    accessToken = 'mocked_access_token';
                    return accessToken;
                }
                if (secret === process.env.REFRESH_TOKEN_SECRET) {
                    refreshToken = 'mocked_refresh_token';
                    return refreshToken;
                }
            });

            const saveRefreshTokenMock = jest.fn().mockResolvedValue();
            UserService.saveRefreshToken = saveRefreshTokenMock;

            // Spy on the generateAccessToken and generateRefreshToken methods
            jest.spyOn(UserService, 'generateAccessToken').mockReturnValue(accessToken);
            jest.spyOn(UserService, 'generateRefreshToken').mockReturnValue(refreshToken);

            // Call the login function
            const result = await UserService.login(loginData.email, loginData.password, rememberMe);

            // Assertions
            expect(UserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, foundUser.password);
            expect(UserService.generateAccessToken).toHaveBeenCalledWith(foundUser);
            expect(UserService.generateRefreshToken).toHaveBeenCalledWith(foundUser);
            expect(saveRefreshTokenMock).toHaveBeenCalledWith(foundUser.id, refreshToken);

            // Check the structure and content of the result
            expect(result).toEqual({
                accessToken,
                refreshToken,
                accessTokenExpiration: expect.any(Date),
                refreshTokenExpiration: expect.any(Date),
                userId: foundUser.id,
                email: foundUser.email
            });

            // Check that the expiration dates are set correctly
            const now = Date.now();
            expect(result.accessTokenExpiration.getTime()).toBeCloseTo(now + 60 * 60 * 1000, -3); // 1 hour, within 1 second
            expect(result.refreshTokenExpiration.getTime()).toBeCloseTo(now + 30 * 24 * 60 * 60 * 1000, -3); // 30 days, within 1 second
        });

        it('should throw an error for invalid email', async () => {
            UserRepository.findByEmail.mockResolvedValue(null);
            await expect(UserService.login('invalid@example.com', 'password123')).rejects.toThrow('Invalid credentials');
        });

        it('should throw an error for invalid password', async () => {
            const foundUser = { id: 1, email: 'user@example.com', password: 'hashed_password' };
            UserRepository.findByEmail.mockResolvedValue(foundUser);
            bcrypt.compare.mockResolvedValue(false);
            await expect(UserService.login('user@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
        });
    });
   
    describe('validateOpt', () => {
        const mockOtpDetails = { user_id: 1, otp_code: '123456' };
        let mockOpt;

        beforeEach(() => {
            mockOpt = {
                id: 1,
                user_id: 1,
                otp_code: '123456',
                is_used: false,
                expires_at: new Date(Date.now() + 600000) // 10 minutes from now
            };
            OptRepository.findByUserIdAndOtpCode = jest.fn();
            OptRepository.update = jest.fn();
        });

        it('should return true for valid OTP', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(mockOpt);
            OptRepository.update.mockResolvedValue(true);

            const result = await UserService.validateOpt(mockOtpDetails);

            expect(result).toBe(true);
            expect(OptRepository.findByUserIdAndOtpCode).toHaveBeenCalledWith(mockOtpDetails.user_id, mockOtpDetails.otp_code);
            expect(OptRepository.update).toHaveBeenCalledWith({ id: mockOpt.id, is_used: true });
        });

        it('should throw an error for invalid OTP', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(null);

            await expect(UserService.validateOpt(mockOtpDetails)).rejects.toThrow('Invalid OTP');
        });

        it('should throw an error for used OTP', async () => {
            mockOpt.is_used = true;
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(mockOpt);

            await expect(UserService.validateOpt(mockOtpDetails)).rejects.toThrow('OTP has been used');
        });

        it('should throw an error for expired OTP', async () => {
            mockOpt.expires_at = new Date(Date.now() - 600000); // 10 minutes ago
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(mockOpt);

            await expect(UserService.validateOpt(mockOtpDetails)).rejects.toThrow('OTP has expired');
        });

        it('should update OTP as used after successful validation', async () => {
            OptRepository.findByUserIdAndOtpCode.mockResolvedValue(mockOpt);
            OptRepository.update.mockResolvedValue(true);

            await UserService.validateOpt(mockOtpDetails);

            expect(OptRepository.update).toHaveBeenCalledWith({ id: mockOpt.id, is_used: true });
        });
    });
});