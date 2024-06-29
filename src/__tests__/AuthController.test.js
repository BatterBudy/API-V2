import AuthController from '../controllers/AuthController';
import UserService from '../services/UserService';
import { validationResult } from 'express-validator';

jest.mock('../services/UserService');
jest.mock('express-validator');

describe('AuthController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user and return a user', async () => {

            req.body = {
                first_name: 'test_first_name',
                last_name: 'test_last_name',
                email: 'test@example.com',
                phone_number: '08099989978',
                password: 'password123'
            };

            validationResult.mockReturnValue({ isEmpty: () => true });
            const registeredUser = {
                id: 1,
                first_name: 'test_first_name',
                last_name: 'test_last_name',
                email: 'test@example.com',
                phone_number: '08099989978',
                role: 'user',
                is_active: 1,
                is_deleted: 0,
                is_confirmed: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
            UserService.register.mockResolvedValue(registeredUser);

            await AuthController.register(req, res);

            expect(UserService.register).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ user: registeredUser });
        });



        it('should return validation errors if present', async () => {
            const mockErrors = { array: () => [{ msg: 'Invalid email' }] };
            validationResult.mockReturnValue({ isEmpty: () => false, ...mockErrors });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
        });
    });

    describe('login', () => {
        it('should login a user and return a token', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            validationResult.mockReturnValue({ isEmpty: () => true });
            UserService.login.mockResolvedValue('mocked_token');

            await AuthController.login(req, res);

            expect(UserService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
            expect(res.json).toHaveBeenCalledWith({ token: 'mocked_token' });
        });

        it('should return validation errors if present', async () => {
            const mockErrors = { array: () => [{ msg: 'Email is required' }] };
            validationResult.mockReturnValue({ isEmpty: () => false, ...mockErrors });

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
        });

        it('should return 401 for invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            validationResult.mockReturnValue({ isEmpty: () => true });
            UserService.login.mockRejectedValue(new Error('Invalid credentials'));

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });

    
});