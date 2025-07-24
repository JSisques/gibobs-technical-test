import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
    private readonly logger = new Logger(UsersRepository.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(user: User): Promise<User> {
        this.logger.log(`Creating user with email: ${user.email}`);
        return await this.usersRepository.save(user);
    }

    async findOne(id: string): Promise<User> {
        this.logger.log(`Finding user with id: ${id}`);
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });

        if (!user) {
            this.logger.warn(`User with id ${id} not found`);
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        this.logger.log(`Finding user with email: ${email}`);
        return await this.usersRepository.findOne({
            where: { email },
            relations: ['tasks'],
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        this.logger.log(`Updating user with id: ${id}`);

        // First check if user exists
        const existingUser = await this.findOne(id);

        await this.usersRepository.update(id, updateUserDto);
        return await this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        this.logger.log(`Removing user with id: ${id}`);

        // First check if user exists
        await this.findOne(id);

        await this.usersRepository.delete(id);
    }

    async count(): Promise<number> {
        this.logger.log('Counting all users');
        return await this.usersRepository.count();
    }
}
