import UserService from '../services/UserService';
import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../repositories/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {

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

                UserRepository.findByEmailOrPhoneNumber = jest.fn().mockResolvedValue(null);
                UserRepository.create = jest.fn().mockResolvedValue(createdUser);

                const result = await UserService.register(userData);

                expect(UserRepository.findByEmailOrPhoneNumber).toHaveBeenCalledWith(userData.email, userData.phone_number);
                expect(UserRepository.create).toHaveBeenCalledWith(userData);

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
        it('should return a token for valid credentials', async () => {
            const loginData = { email: 'user@example.com', password: 'password123' };
            const foundUser = { id: 1, ...loginData, password: 'hashed_password' };
            UserRepository.findByEmail.mockResolvedValue(foundUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mocked_token');

            const result = await UserService.login(loginData.email, loginData.password);

            expect(UserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, foundUser.password);
            expect(jwt.sign).toHaveBeenCalled();
            expect(result).toBe('mocked_token');
        });

        it('should throw an error for invalid credentials', async () => {
            const loginData = { email: 'user@example.com', password: 'wrongpassword' };
            UserRepository.findByEmail.mockResolvedValue(null);

            await expect(UserService.login(loginData.email, loginData.password)).rejects.toThrow('Invalid credentials');
        });
    });
});