import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TasksRepository {
    private readonly logger = new Logger(TasksRepository.name);
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    async findAllByOwner(
        ownerId: string,
        page: number,
        limit: number,
    ): Promise<Task[]> {
        this.logger.log(
            `Finding tasks for owner ${ownerId} with page ${page} and limit ${limit}`,
        );
        return await this.tasksRepository.find({
            where: { owner: { id: ownerId } },
            relations: ['owner'],
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getTaskByOwner(id: string, ownerId: string): Promise<Task> {
        this.logger.log(`Getting task ${id} for owner ${ownerId}`);
        const task = await this.tasksRepository.findOne({
            where: { id, owner: { id: ownerId } },
            relations: ['owner'],
        });

        if (!task) {
            this.logger.warn(`Task ${id} not found for owner ${ownerId}`);
            throw new NotFoundException(`Task with id ${id} not found`);
        }

        return task;
    }

    async editTaskByOwner(
        id: string,
        body: UpdateTaskDto,
        ownerId: string,
    ): Promise<Task> {
        this.logger.log(`Editing task ${id} for owner ${ownerId}`);

        // First check if task exists and belongs to owner
        const existingTask = await this.getTaskByOwner(id, ownerId);

        await this.tasksRepository.update(id, body);
        return await this.getTaskByOwner(id, ownerId);
    }

    async createTask(taskData: Partial<Task>, ownerId: string): Promise<Task> {
        this.logger.log(`Creating task for owner ${ownerId}`);

        const task = this.tasksRepository.create({
            ...taskData,
            owner: { id: ownerId },
        });

        return await this.tasksRepository.save(task);
    }

    async countByOwner(ownerId: string): Promise<number> {
        this.logger.log(`Counting tasks for owner ${ownerId}`);
        return await this.tasksRepository.count({
            where: { owner: { id: ownerId } },
        });
    }
}
