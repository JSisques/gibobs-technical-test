import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksService } from '../services/tasks.service';
import { TasksController } from './tasks.controller';

describe('TasksController', () => {
    let controller: TasksController;
    let tasksService: TasksService;

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

    const mockTasksService = {
        listTasks: jest.fn(),
        getTask: jest.fn(),
        createTask: jest.fn(),
        editTask: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: mockTasksService,
                },
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listTasks', () => {
        const page = '1';
        const limit = '10';
        const userId = 'test-user-id';

        it('should return tasks with pagination', async () => {
            const tasks = [mockTask];
            const total = 1;
            const mockResponse = { tasks, total };
            mockTasksService.listTasks.mockResolvedValue(mockResponse);

            const result = await controller.listTasks(page, limit, {
                user: { id: userId },
            });

            expect(mockTasksService.listTasks).toHaveBeenCalledWith(
                page,
                limit,
                userId,
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty task list', async () => {
            const tasks = [];
            const total = 0;
            const mockResponse = { tasks, total };
            mockTasksService.listTasks.mockResolvedValue(mockResponse);

            const result = await controller.listTasks(page, limit, {
                user: { id: userId },
            });

            expect(result).toEqual(mockResponse);
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            mockTasksService.listTasks.mockRejectedValue(error);

            await expect(
                controller.listTasks(page, limit, { user: { id: userId } }),
            ).rejects.toThrow('Service error');
        });

        it('should handle different page and limit values', async () => {
            const tasks = [mockTask];
            const total = 1;
            const mockResponse = { tasks, total };
            mockTasksService.listTasks.mockResolvedValue(mockResponse);

            const result = await controller.listTasks('2', '5', {
                user: { id: userId },
            });

            expect(mockTasksService.listTasks).toHaveBeenCalledWith(
                2,
                5,
                userId,
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getTask', () => {
        const taskId = 'test-task-id';
        const userId = 'test-user-id';

        it('should return a specific task', async () => {
            mockTasksService.getTask.mockResolvedValue(mockTask);

            const result = await controller.getTask(taskId, {
                user: { id: userId },
            });

            expect(mockTasksService.getTask).toHaveBeenCalledWith(
                taskId,
                userId,
            );
            expect(result).toEqual(mockTask);
        });

        it('should handle task not found', async () => {
            mockTasksService.getTask.mockRejectedValue(
                new NotFoundException('Task not found'),
            );

            await expect(
                controller.getTask(taskId, { user: { id: userId } }),
            ).rejects.toThrow(NotFoundException);
            expect(mockTasksService.getTask).toHaveBeenCalledWith(
                taskId,
                userId,
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            mockTasksService.getTask.mockRejectedValue(error);

            await expect(
                controller.getTask(taskId, { user: { id: userId } }),
            ).rejects.toThrow('Service error');
        });
    });

    describe('createTask', () => {
        const createTaskDto: CreateTaskDto = {
            title: 'New Task',
            description: 'New Description',
            dueDate: '2024-12-31T23:59:59.000Z',
            done: false,
        };
        const userId = 'test-user-id';

        it('should create a new task', async () => {
            const newTask = {
                ...mockTask,
                id: 'new-task-id',
                title: createTaskDto.title,
            };
            mockTasksService.createTask.mockResolvedValue(newTask);

            const result = await controller.createTask(createTaskDto, {
                user: { id: userId },
            });

            expect(mockTasksService.createTask).toHaveBeenCalledWith(
                createTaskDto,
                userId,
            );
            expect(result).toEqual(newTask);
        });

        it('should handle creation errors', async () => {
            const error = new Error('Creation failed');
            mockTasksService.createTask.mockRejectedValue(error);

            await expect(
                controller.createTask(createTaskDto, { user: { id: userId } }),
            ).rejects.toThrow('Creation failed');
            expect(mockTasksService.createTask).toHaveBeenCalledWith(
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
            mockTasksService.createTask.mockResolvedValue(newTask);

            const result = await controller.createTask(createTaskDtoWithDone, {
                user: { id: userId },
            });

            expect(mockTasksService.createTask).toHaveBeenCalledWith(
                createTaskDtoWithDone,
                userId,
            );
            expect(result).toEqual(newTask);
        });

        it('should handle validation errors', async () => {
            const invalidCreateTaskDto = {
                title: '',
                description: 'Valid description',
                dueDate: 'invalid-date',
                done: false,
            };

            mockTasksService.createTask.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.createTask(invalidCreateTaskDto as any, {
                    user: { id: userId },
                }),
            ).rejects.toThrow('Validation error');
        });
    });

    describe('editTask', () => {
        const taskId = 'test-task-id';
        const updateTaskDto: UpdateTaskDto = {
            title: 'Updated Task',
            description: 'Updated Description',
            done: true,
        };
        const userId = 'test-user-id';

        it('should update a task', async () => {
            const updatedTask = { ...mockTask, ...updateTaskDto };
            mockTasksService.editTask.mockResolvedValue(updatedTask);

            const result = await controller.editTask(updateTaskDto, taskId, {
                user: { id: userId },
            });

            expect(mockTasksService.editTask).toHaveBeenCalledWith(
                taskId,
                updateTaskDto,
                userId,
            );
            expect(result).toEqual(updatedTask);
        });

        it('should handle partial updates', async () => {
            const partialUpdate: UpdateTaskDto = { done: true };
            const updatedTask = { ...mockTask, done: true };
            mockTasksService.editTask.mockResolvedValue(updatedTask);

            const result = await controller.editTask(partialUpdate, taskId, {
                user: { id: userId },
            });

            expect(mockTasksService.editTask).toHaveBeenCalledWith(
                taskId,
                partialUpdate,
                userId,
            );
            expect(result).toEqual(updatedTask);
        });

        it('should handle task not found', async () => {
            mockTasksService.editTask.mockRejectedValue(
                new NotFoundException('Task not found'),
            );

            await expect(
                controller.editTask(updateTaskDto, taskId, {
                    user: { id: userId },
                }),
            ).rejects.toThrow(NotFoundException);
            expect(mockTasksService.editTask).toHaveBeenCalledWith(
                taskId,
                updateTaskDto,
                userId,
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Update error');
            mockTasksService.editTask.mockRejectedValue(error);

            await expect(
                controller.editTask(updateTaskDto, taskId, {
                    user: { id: userId },
                }),
            ).rejects.toThrow('Update error');
        });

        it('should handle validation errors', async () => {
            const invalidUpdateTaskDto = {
                title: '',
                description: 'Valid description',
                done: 'invalid-boolean',
            };

            mockTasksService.editTask.mockRejectedValue(
                new Error('Validation error'),
            );

            await expect(
                controller.editTask(invalidUpdateTaskDto as any, taskId, {
                    user: { id: userId },
                }),
            ).rejects.toThrow('Validation error');
        });
    });
});
