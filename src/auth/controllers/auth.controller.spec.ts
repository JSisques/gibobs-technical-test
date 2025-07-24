import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from '../dtos/login.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        signIn: jest.fn(),
        signUp: jest.fn(),
    };

    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        tasks: [],
    };

    const mockAuthResponse = {
        accessToken: 'mock-jwt-token',
        user: mockUser,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signIn', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should sign in successfully with valid credentials', async () => {
            mockAuthService.signIn.mockResolvedValue(mockAuthResponse);

            const result = await controller.signIn(loginDto);

            expect(mockAuthService.signIn).toHaveBeenCalledWith(
                loginDto.email,
                loginDto.password,
            );
            expect(result).toEqual(mockAuthResponse);
        });

        it('should handle authentication errors', async () => {
            mockAuthService.signIn.mockRejectedValue(
                new UnauthorizedException('Invalid credentials'),
            );

            await expect(controller.signIn(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockAuthService.signIn).toHaveBeenCalledWith(
                loginDto.email,
                loginDto.password,
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            mockAuthService.signIn.mockRejectedValue(error);

            await expect(controller.signIn(loginDto)).rejects.toThrow(
                'Service error',
            );
        });
    });

    describe('signUp', () => {
        const signUpDto: SignUpDto = {
            email: 'new@example.com',
            password: 'password123',
            fullname: 'New User',
        };

        it('should sign up successfully with valid data', async () => {
            const newUser = {
                ...mockUser,
                id: 'new-user-id',
                email: signUpDto.email,
                fullname: signUpDto.fullname,
            };
            const signUpResponse = {
                accessToken: 'mock-jwt-token',
                user: newUser,
            };
            mockAuthService.signUp.mockResolvedValue(signUpResponse);

            const result = await controller.signUp(signUpDto);

            expect(mockAuthService.signUp).toHaveBeenCalledWith(
                signUpDto.email,
                signUpDto.password,
                signUpDto.fullname,
            );
            expect(result).toEqual(signUpResponse);
        });

        it('should handle registration errors', async () => {
            const error = new Error('Registration failed');
            mockAuthService.signUp.mockRejectedValue(error);

            await expect(controller.signUp(signUpDto)).rejects.toThrow(
                'Registration failed',
            );
            expect(mockAuthService.signUp).toHaveBeenCalledWith(
                signUpDto.email,
                signUpDto.password,
                signUpDto.fullname,
            );
        });

        it('should handle validation errors', async () => {
            const invalidSignUpDto = {
                email: 'invalid-email',
                password: '123',
                fullname: '',
            };

            mockAuthService.signUp.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.signUp(invalidSignUpDto as any),
            ).rejects.toThrow('Validation error');
        });
    });
});
