import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateEmailDto } from '../dtos/update-email.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: UsersService;

    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'hashedPassword',
        tasks: [],
    };

    const mockUsersService = {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateEmail: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createUserDto: CreateUserDto = {
            email: 'new@example.com',
            password: 'password123',
            fullname: 'New User',
        };

        it('should create a new user', async () => {
            const newUser = {
                ...mockUser,
                id: 'new-user-id',
                email: createUserDto.email,
                fullname: createUserDto.fullname,
            };
            mockUsersService.create.mockResolvedValue(newUser);

            const result = await controller.create(createUserDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(newUser);
        });

        it('should handle creation errors', async () => {
            const error = new Error('Creation failed');
            mockUsersService.create.mockRejectedValue(error);

            await expect(controller.create(createUserDto)).rejects.toThrow(
                'Creation failed',
            );
            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should handle conflict errors', async () => {
            mockUsersService.create.mockRejectedValue(
                new ConflictException('Email already exists'),
            );

            await expect(controller.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should handle validation errors', async () => {
            const invalidCreateUserDto = {
                email: 'invalid-email',
                password: '123',
                fullname: '',
            };

            mockUsersService.create.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.create(invalidCreateUserDto as any),
            ).rejects.toThrow('Validation error');
        });
    });

    describe('findOne', () => {
        const userId = 'test-user-id';

        it('should return a specific user', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(userId);

            expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should handle user not found', async () => {
            mockUsersService.findOne.mockRejectedValue(
                new NotFoundException('User not found'),
            );

            await expect(controller.findOne(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            mockUsersService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(userId)).rejects.toThrow(
                'Service error',
            );
        });
    });

    describe('update', () => {
        const userId = 'test-user-id';
        const updateUserDto: UpdateUserDto = {
            email: 'updated@example.com',
            fullname: 'Updated User',
        };

        it('should update a user', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(userId, updateUserDto);

            expect(mockUsersService.update).toHaveBeenCalledWith(
                userId,
                updateUserDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should handle partial updates', async () => {
            const partialUpdate: UpdateUserDto = { fullname: 'New Name' };
            const updatedUser = { ...mockUser, fullname: 'New Name' };
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(userId, partialUpdate);

            expect(mockUsersService.update).toHaveBeenCalledWith(
                userId,
                partialUpdate,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should handle user not found', async () => {
            mockUsersService.update.mockRejectedValue(
                new NotFoundException('User not found'),
            );

            await expect(
                controller.update(userId, updateUserDto),
            ).rejects.toThrow(NotFoundException);
            expect(mockUsersService.update).toHaveBeenCalledWith(
                userId,
                updateUserDto,
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Update error');
            mockUsersService.update.mockRejectedValue(error);

            await expect(
                controller.update(userId, updateUserDto),
            ).rejects.toThrow('Update error');
        });

        it('should handle validation errors', async () => {
            const invalidUpdateUserDto = {
                email: 'invalid-email',
                fullname: '',
            };

            mockUsersService.update.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.update(userId, invalidUpdateUserDto as any),
            ).rejects.toThrow('Validation error');
        });
    });

    describe('updateEmail', () => {
        const userId = 'test-user-id';
        const updateEmailDto: UpdateEmailDto = {
            email: 'newemail@example.com',
        };

        it('should update user email', async () => {
            const updatedUser = { ...mockUser, email: updateEmailDto.email };
            mockUsersService.updateEmail.mockResolvedValue(updatedUser);

            const result = await controller.updateEmail(userId, updateEmailDto);

            expect(mockUsersService.updateEmail).toHaveBeenCalledWith(
                userId,
                updateEmailDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should handle user not found', async () => {
            mockUsersService.updateEmail.mockRejectedValue(
                new NotFoundException('User not found'),
            );

            await expect(
                controller.updateEmail(userId, updateEmailDto),
            ).rejects.toThrow(NotFoundException);
            expect(mockUsersService.updateEmail).toHaveBeenCalledWith(
                userId,
                updateEmailDto,
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Update error');
            mockUsersService.updateEmail.mockRejectedValue(error);

            await expect(
                controller.updateEmail(userId, updateEmailDto),
            ).rejects.toThrow('Update error');
        });

        it('should handle validation errors', async () => {
            const invalidUpdateEmailDto = {
                email: 'invalid-email',
            };

            mockUsersService.updateEmail.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.updateEmail(userId, invalidUpdateEmailDto as any),
            ).rejects.toThrow('Validation error');
        });
    });

    describe('remove', () => {
        const userId = 'test-user-id';

        it('should remove a user', async () => {
            mockUsersService.remove.mockResolvedValue(undefined);

            await controller.remove(userId);

            expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
        });

        it('should handle user not found', async () => {
            mockUsersService.remove.mockRejectedValue(
                new NotFoundException('User not found'),
            );

            await expect(controller.remove(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
        });

        it('should handle service errors', async () => {
            const error = new Error('Remove error');
            mockUsersService.remove.mockRejectedValue(error);

            await expect(controller.remove(userId)).rejects.toThrow(
                'Remove error',
            );
        });
    });
});
