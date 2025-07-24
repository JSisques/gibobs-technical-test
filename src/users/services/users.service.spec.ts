import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateEmailDto } from '../dtos/update-email.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;
    let usersRepository: UsersRepository;
    let encryptionService: EncryptionService;

    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'hashedPassword',
        tasks: [],
    };

    const mockUsersRepository = {
        findByEmail: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockEncryptionService = {
        hashPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UsersRepository,
                    useValue: mockUsersRepository,
                },
                {
                    provide: EncryptionService,
                    useValue: mockEncryptionService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        usersRepository = module.get<UsersRepository>(UsersRepository);
        encryptionService = module.get<EncryptionService>(EncryptionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByEmail', () => {
        const email = 'test@example.com';

        it('should return user when found', async () => {
            mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

            const result = await service.findByEmail(email);

            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found', async () => {
            mockUsersRepository.findByEmail.mockResolvedValue(null);

            const result = await service.findByEmail(email);

            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toBeNull();
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database error');
            mockUsersRepository.findByEmail.mockRejectedValue(error);

            await expect(service.findByEmail(email)).rejects.toThrow(
                'Database error',
            );
            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
        });
    });

    describe('findOne', () => {
        const userId = 'test-user-id';

        it('should return user when found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(userId);

            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database error');
            mockUsersRepository.findOne.mockRejectedValue(error);

            await expect(service.findOne(userId)).rejects.toThrow(
                'Database error',
            );
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
        });
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            email: 'new@example.com',
            password: 'password123',
            fullname: 'New User',
        };
        const hashedPassword = 'hashedPassword123';

        it('should create user successfully', async () => {
            const newUser = {
                ...mockUser,
                id: 'new-user-id',
                email: createUserDto.email,
                fullname: createUserDto.fullname,
            };
            mockUsersRepository.findByEmail.mockResolvedValue(null);
            mockEncryptionService.hashPassword.mockResolvedValue(
                hashedPassword,
            );
            mockUsersRepository.create.mockResolvedValue(newUser);

            const result = await service.create(createUserDto);

            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
                createUserDto.email,
            );
            expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
                createUserDto.password,
            );
            expect(mockUsersRepository.create).toHaveBeenCalledWith({
                email: createUserDto.email,
                pass: hashedPassword,
                fullname: createUserDto.fullname,
            });
            expect(result).toEqual(newUser);
        });

        it('should throw ConflictException when email already exists', async () => {
            mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
                createUserDto.email,
            );
            expect(mockEncryptionService.hashPassword).not.toHaveBeenCalled();
            expect(mockUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should handle encryption service errors', async () => {
            mockUsersRepository.findByEmail.mockResolvedValue(null);
            mockEncryptionService.hashPassword.mockRejectedValue(
                new Error('Encryption error'),
            );

            await expect(service.create(createUserDto)).rejects.toThrow(
                'Encryption error',
            );
            expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
                createUserDto.email,
            );
            expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
                createUserDto.password,
            );
            expect(mockUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should handle repository creation errors', async () => {
            mockUsersRepository.findByEmail.mockResolvedValue(null);
            mockEncryptionService.hashPassword.mockResolvedValue(
                hashedPassword,
            );
            mockUsersRepository.create.mockRejectedValue(
                new Error('Creation error'),
            );

            await expect(service.create(createUserDto)).rejects.toThrow(
                'Creation error',
            );
            expect(mockUsersRepository.create).toHaveBeenCalledWith({
                email: createUserDto.email,
                pass: hashedPassword,
                fullname: createUserDto.fullname,
            });
        });
    });

    describe('update', () => {
        const userId = 'test-user-id';
        const updateUserDto: UpdateUserDto = {
            email: 'updated@example.com',
            fullname: 'Updated User',
        };

        it('should update user successfully', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.update.mockResolvedValue(updatedUser);

            const result = await service.update(userId, updateUserDto);

            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.update).toHaveBeenCalledWith(
                userId,
                updateUserDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);

            await expect(service.update(userId, updateUserDto)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.update).not.toHaveBeenCalled();
        });

        it('should handle repository update errors', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.update.mockRejectedValue(
                new Error('Update error'),
            );

            await expect(service.update(userId, updateUserDto)).rejects.toThrow(
                'Update error',
            );
            expect(mockUsersRepository.update).toHaveBeenCalledWith(
                userId,
                updateUserDto,
            );
        });
    });

    describe('updateEmail', () => {
        const userId = 'test-user-id';
        const updateEmailDto: UpdateEmailDto = {
            email: 'newemail@example.com',
        };

        it('should update email successfully', async () => {
            const updatedUser = { ...mockUser, email: updateEmailDto.email };
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.update.mockResolvedValue(updatedUser);

            const result = await service.updateEmail(userId, updateEmailDto);

            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.update).toHaveBeenCalledWith(
                userId,
                updateEmailDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);

            await expect(
                service.updateEmail(userId, updateEmailDto),
            ).rejects.toThrow(NotFoundException);
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.update).not.toHaveBeenCalled();
        });

        it('should handle repository update errors', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.update.mockRejectedValue(
                new Error('Update error'),
            );

            await expect(
                service.updateEmail(userId, updateEmailDto),
            ).rejects.toThrow('Update error');
            expect(mockUsersRepository.update).toHaveBeenCalledWith(
                userId,
                updateEmailDto,
            );
        });
    });

    describe('remove', () => {
        const userId = 'test-user-id';

        it('should remove user successfully', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.remove.mockResolvedValue(undefined);

            await service.remove(userId);

            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.remove).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith(userId);
            expect(mockUsersRepository.remove).not.toHaveBeenCalled();
        });

        it('should handle repository remove errors', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockUsersRepository.remove.mockRejectedValue(
                new Error('Remove error'),
            );

            await expect(service.remove(userId)).rejects.toThrow(
                'Remove error',
            );
            expect(mockUsersRepository.remove).toHaveBeenCalledWith(userId);
        });
    });
});
