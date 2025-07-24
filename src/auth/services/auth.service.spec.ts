import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from '../../common/services/encryption.service';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let encryptionService: EncryptionService;

    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'hashedPassword',
        tasks: [],
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockEncryptionService = {
        comparePassword: jest.fn(),
        hashPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: EncryptionService,
                    useValue: mockEncryptionService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        encryptionService = module.get<EncryptionService>(EncryptionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signIn', () => {
        const email = 'test@example.com';
        const password = 'password123';
        const mockToken = 'mock-jwt-token';

        it('should sign in successfully with valid credentials', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockEncryptionService.comparePassword.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(mockToken);

            const result = await service.signIn(email, password);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(mockEncryptionService.comparePassword).toHaveBeenCalledWith(
                password,
                mockUser.pass,
            );
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
            });
            expect(result).toEqual({
                accessToken: mockToken,
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    fullname: mockUser.fullname,
                    tasks: mockUser.tasks,
                },
            });
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(service.signIn(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(
                mockEncryptionService.comparePassword,
            ).not.toHaveBeenCalled();
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockEncryptionService.comparePassword.mockResolvedValue(false);

            await expect(service.signIn(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(mockEncryptionService.comparePassword).toHaveBeenCalledWith(
                password,
                mockUser.pass,
            );
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password comparison fails', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockEncryptionService.comparePassword.mockRejectedValue(
                new Error('Encryption error'),
            );

            await expect(service.signIn(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('signUp', () => {
        const email = 'new@example.com';
        const password = 'password123';
        const fullname = 'New User';
        const mockToken = 'mock-jwt-token';
        const hashedPassword = 'hashedPassword123';

        it('should sign up successfully with valid data', async () => {
            const newUser = { ...mockUser, id: 'new-user-id', email, fullname };
            mockUsersService.create.mockResolvedValue(newUser);
            mockEncryptionService.hashPassword.mockResolvedValue(
                hashedPassword,
            );
            mockJwtService.sign.mockReturnValue(mockToken);

            const result = await service.signUp(email, password, fullname);

            expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
                password,
            );
            expect(mockUsersService.create).toHaveBeenCalledWith({
                email,
                password: hashedPassword,
                fullname,
            });
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                id: newUser.id,
                email: newUser.email,
            });
            expect(result).toEqual({
                accessToken: mockToken,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    fullname: newUser.fullname,
                    tasks: newUser.tasks,
                },
            });
        });

        it('should handle encryption service errors', async () => {
            mockEncryptionService.hashPassword.mockRejectedValue(
                new Error('Encryption error'),
            );

            await expect(
                service.signUp(email, password, fullname),
            ).rejects.toThrow('Encryption error');
            expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
                password,
            );
            expect(mockUsersService.create).not.toHaveBeenCalled();
        });

        it('should handle user service errors', async () => {
            const errorMessage = 'User creation failed';
            mockEncryptionService.hashPassword.mockResolvedValue(
                hashedPassword,
            );
            mockUsersService.create.mockRejectedValue(new Error(errorMessage));

            await expect(
                service.signUp(email, password, fullname),
            ).rejects.toThrow(errorMessage);
            expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
                password,
            );
            expect(mockUsersService.create).toHaveBeenCalledWith({
                email,
                password: hashedPassword,
                fullname,
            });
        });

        it('should handle JWT service errors', async () => {
            const newUser = { ...mockUser, id: 'new-user-id', email, fullname };
            mockUsersService.create.mockResolvedValue(newUser);
            mockEncryptionService.hashPassword.mockResolvedValue(
                hashedPassword,
            );
            mockJwtService.sign.mockImplementation(() => {
                throw new Error('JWT signing failed');
            });

            await expect(
                service.signUp(email, password, fullname),
            ).rejects.toThrow('JWT signing failed');
        });
    });
});
