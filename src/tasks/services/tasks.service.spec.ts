import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
    let service: TasksService;
    let tasksRepository: TasksRepository;

    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'hashedPassword',
        tasks: [],
    };

    const mockTask: Task = {
        id: 'test-task-id',
        title: 'Test Task',
        description: 'Test Description',
        done: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        owner: mockUser,
    };

    const mockTasksRepository = {
        findAllByOwner: jest.fn(),
        getTaskByOwner: jest.fn(),
        editTaskByOwner: jest.fn(),
        createTask: jest.fn(),
        countByOwner: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: TasksRepository,
                    useValue: mockTasksRepository,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        tasksRepository = module.get<TasksRepository>(TasksRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listTasks', () => {
        const userId = 'test-user-id';
        const page = 1;
        const limit = 10;

        it('should return tasks and total count', async () => {
            const tasks = [mockTask];
            const total = 1;
            mockTasksRepository.findAllByOwner.mockResolvedValue(tasks);
            mockTasksRepository.countByOwner.mockResolvedValue(total);

            const result = await service.listTasks(page, limit, userId);

            expect(mockTasksRepository.findAllByOwner).toHaveBeenCalledWith(
                userId,
                page,
                limit,
            );
            expect(mockTasksRepository.countByOwner).toHaveBeenCalledWith(
                userId,
            );
            expect(result).toEqual({ tasks, total });
        });

        it('should handle empty task list', async () => {
            const tasks = [];
            const total = 0;
            mockTasksRepository.findAllByOwner.mockResolvedValue(tasks);
            mockTasksRepository.countByOwner.mockResolvedValue(total);

            const result = await service.listTasks(page, limit, userId);

            expect(result).toEqual({ tasks, total });
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database error');
            mockTasksRepository.findAllByOwner.mockRejectedValue(error);

            await expect(
                service.listTasks(page, limit, userId),
            ).rejects.toThrow('Database error');
            expect(mockTasksRepository.findAllByOwner).toHaveBeenCalledWith(
                userId,
                page,
                limit,
            );
        });

        it('should handle count repository errors', async () => {
            const tasks = [mockTask];
            const error = new Error('Count error');
            mockTasksRepository.findAllByOwner.mockResolvedValue(tasks);
            mockTasksRepository.countByOwner.mockRejectedValue(error);

            await expect(
                service.listTasks(page, limit, userId),
            ).rejects.toThrow('Count error');
            expect(mockTasksRepository.countByOwner).toHaveBeenCalledWith(
                userId,
            );
        });
    });

    describe('getTask', () => {
        const taskId = 'test-task-id';
        const userId = 'test-user-id';

        it('should return task when found', async () => {
            mockTasksRepository.getTaskByOwner.mockResolvedValue(mockTask);

            const result = await service.getTask(taskId, userId);

            expect(mockTasksRepository.getTaskByOwner).toHaveBeenCalledWith(
                taskId,
                userId,
            );
            expect(result).toEqual(mockTask);
        });

        it('should throw NotFoundException when task not found', async () => {
            mockTasksRepository.getTaskByOwner.mockRejectedValue(
                new NotFoundException(`Task with id ${taskId} not found`),
            );

            await expect(service.getTask(taskId, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockTasksRepository.getTaskByOwner).toHaveBeenCalledWith(
                taskId,
                userId,
            );
        });

        it('should handle repository errors', async () => {
            const error = new Error('Database error');
            mockTasksRepository.getTaskByOwner.mockRejectedValue(error);

            await expect(service.getTask(taskId, userId)).rejects.toThrow(
                'Database error',
            );
            expect(mockTasksRepository.getTaskByOwner).toHaveBeenCalledWith(
                taskId,
                userId,
            );
        });
    });

    describe('editTask', () => {
        const taskId = 'test-task-id';
        const userId = 'test-user-id';
        const updateTaskDto: UpdateTaskDto = {
            title: 'Updated Task',
            description: 'Updated Description',
            done: true,
        };

        it('should edit task successfully', async () => {
            const updatedTask = { ...mockTask, ...updateTaskDto };
            mockTasksRepository.editTaskByOwner.mockResolvedValue(updatedTask);

            const result = await service.editTask(
                taskId,
                updateTaskDto,
                userId,
            );

            expect(mockTasksRepository.editTaskByOwner).toHaveBeenCalledWith(
                taskId,
                updateTaskDto,
                userId,
            );
            expect(result).toEqual(updatedTask);
        });

        it('should handle repository errors', async () => {
            const error = new Error('Update error');
            mockTasksRepository.editTaskByOwner.mockRejectedValue(error);

            await expect(
                service.editTask(taskId, updateTaskDto, userId),
            ).rejects.toThrow('Update error');
            expect(mockTasksRepository.editTaskByOwner).toHaveBeenCalledWith(
                taskId,
                updateTaskDto,
                userId,
            );
        });

        it('should handle partial updates', async () => {
            const partialUpdate: UpdateTaskDto = { done: true };
            const updatedTask = { ...mockTask, done: true };
            mockTasksRepository.editTaskByOwner.mockResolvedValue(updatedTask);

            const result = await service.editTask(
                taskId,
                partialUpdate,
                userId,
            );

            expect(mockTasksRepository.editTaskByOwner).toHaveBeenCalledWith(
                taskId,
                partialUpdate,
                userId,
            );
            expect(result).toEqual(updatedTask);
        });
    });

    describe('createTask', () => {
        const userId = 'test-user-id';
        const createTaskDto: CreateTaskDto = {
            title: 'New Task',
            description: 'New Description',
            dueDate: '2024-12-31T23:59:59.000Z',
            done: false,
        };

        it('should create task successfully', async () => {
            const newTask = {
                ...mockTask,
                id: 'new-task-id',
                title: createTaskDto.title,
            };
            mockTasksRepository.createTask.mockResolvedValue(newTask);

            const result = await service.createTask(createTaskDto, userId);

            expect(mockTasksRepository.createTask).toHaveBeenCalledWith(
                createTaskDto,
                userId,
            );
            expect(result).toEqual(newTask);
        });

        it('should handle repository errors', async () => {
            const error = new Error('Creation error');
            mockTasksRepository.createTask.mockRejectedValue(error);

            await expect(
                service.createTask(createTaskDto, userId),
            ).rejects.toThrow('Creation error');
            expect(mockTasksRepository.createTask).toHaveBeenCalledWith(
                createTaskDto,
                userId,
            );
        });

        it('should handle task with done status', async () => {
            const createTaskDtoWithDone: CreateTaskDto = {
                ...createTaskDto,
                done: true,
            };
            const newTask = { ...mockTask, id: 'new-task-id', done: true };
            mockTasksRepository.createTask.mockResolvedValue(newTask);

            const result = await service.createTask(
                createTaskDtoWithDone,
                userId,
            );

            expect(mockTasksRepository.createTask).toHaveBeenCalledWith(
                createTaskDtoWithDone,
                userId,
            );
            expect(result).toEqual(newTask);
        });
    });
});
