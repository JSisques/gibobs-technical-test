import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateEmailDto } from '../dtos/update-email.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly encryptionService: EncryptionService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        this.logger.log(`Creating user with email: ${createUserDto.email}`);

        // 1. Check if user already exists
        const existingUser = await this.usersRepository.findByEmail(
            createUserDto.email,
        );
        if (existingUser) {
            this.logger.warn(
                `User with email ${createUserDto.email} already exists`,
            );
            throw new ConflictException(
                `User with email ${createUserDto.email} already exists`,
            );
        }

        // 2. Create user
        const user = new User();
        user.email = createUserDto.email;
        user.pass = await this.encryptionService.hashPassword(
            createUserDto.password,
        );
        user.fullname = createUserDto.fullname;

        return await this.usersRepository.create(user);
    }

    async findOne(id: string): Promise<User> {
        this.logger.log(`Finding user with id: ${id}`);
        return await this.usersRepository.findOne(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        this.logger.log(`Finding user with email: ${email}`);
        return await this.usersRepository.findByEmail(email);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        this.logger.log(`Updating user with id: ${id}`);

        // 1. Check if the user exists
        const existingUser = await this.usersRepository.findOne(id);

        // 2. If password is being updated, hash it
        if (updateUserDto.password) {
            updateUserDto.password = await this.encryptionService.hashPassword(
                updateUserDto.password,
            );
        }

        // 3. Update user
        return await this.usersRepository.update(id, updateUserDto);
    }

    async updateEmail(
        id: string,
        updateEmailDto: UpdateEmailDto,
    ): Promise<User> {
        this.logger.log(`Updating email for user with id: ${id}`);

        // 1. Check if the user exists
        const existingUser = await this.usersRepository.findOne(id);

        // 2. Check if the new email is already taken by another user
        const existingUserWithNewEmail = await this.usersRepository.findByEmail(
            updateEmailDto.email,
        );

        if (existingUserWithNewEmail && existingUserWithNewEmail.id !== id) {
            this.logger.warn(
                `Email update failed: ${updateEmailDto.email} is already taken by user ${existingUser.id}`,
            );
            throw new ConflictException(
                `Email ${updateEmailDto.email} is already taken`,
            );
        }

        // 3. Check if the user is trying to update to the same email
        const currentUser = await this.usersRepository.findOne(id);
        if (currentUser.email === updateEmailDto.email) {
            this.logger.warn(
                `Email update failed: user ${id} is trying to update to the same email`,
            );
            throw new ConflictException(
                `Email is already set to ${updateEmailDto.email}`,
            );
        }

        this.logger.log(
            `Email updated successfully for user ${id}: ${currentUser.email} -> ${updateEmailDto.email}`,
        );

        return await this.usersRepository.update(id, {
            email: updateEmailDto.email,
        });
    }

    async remove(id: string): Promise<void> {
        this.logger.log(`Removing user with id: ${id}`);

        // 1. Check if the user exists
        await this.usersRepository.findOne(id);

        // 2. Remove user
        await this.usersRepository.remove(id);
    }
}
