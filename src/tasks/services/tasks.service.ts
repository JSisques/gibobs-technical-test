import { Injectable, Logger } from '@nestjs/common';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    constructor(private readonly tasksRepository: TasksRepository) {}

    async listTasks(
        page: number,
        limit: number,
        userId: string,
    ): Promise<{ tasks: Task[]; total: number }> {
        this.logger.log(
            `Listing tasks for user ${userId} with page ${page} and limit ${limit}`,
        );

        const [tasks, total] = await Promise.all([
            this.tasksRepository.findAllByOwner(userId, page, limit),
            this.tasksRepository.countByOwner(userId),
        ]);

        return { tasks, total };
    }

    async getTask(id: string, userId: string): Promise<Task> {
        this.logger.log(`Getting task ${id} for user ${userId}`);
        return await this.tasksRepository.getTaskByOwner(id, userId);
    }

    async editTask(
        id: string,
        body: UpdateTaskDto,
        userId: string,
    ): Promise<Task> {
        this.logger.log(`Editing task ${id} for user ${userId}`);
        return await this.tasksRepository.editTaskByOwner(id, body, userId);
    }

    async createTask(
        createTaskDto: CreateTaskDto,
        userId: string,
    ): Promise<Task> {
        this.logger.log(`Creating task for user ${userId}`);
        return await this.tasksRepository.createTask(createTaskDto, userId);
    }
}
