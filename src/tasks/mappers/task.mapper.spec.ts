import { User } from '../../users/entities/user.entity';
import { Task } from '../entities/task.entity';
import { TaskMapper } from './task.mapper';

describe('TaskMapper', () => {
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

    describe('toResponseDto', () => {
        it('should map task entity to response DTO', () => {
            const result = TaskMapper.toResponseDto(mockTask);

            expect(result).toEqual({
                id: mockTask.id,
                title: mockTask.title,
                description: mockTask.description,
                done: mockTask.done,
                dueDate: mockTask.dueDate,
                owner: {
                    id: mockUser.id,
                    email: mockUser.email,
                    fullname: mockUser.fullname,
                },
            });
        });

        it('should handle task with done status', () => {
            const doneTask = { ...mockTask, done: true };
            const result = TaskMapper.toResponseDto(doneTask);

            expect(result.done).toBe(true);
        });

        it('should handle task with different due date', () => {
            const taskWithDifferentDate = {
                ...mockTask,
                dueDate: '2024-01-01T00:00:00.000Z',
            };
            const result = TaskMapper.toResponseDto(taskWithDifferentDate);

            expect(result.dueDate).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should handle task with different owner', () => {
            const differentOwner: User = {
                id: 'different-user-id',
                email: 'different@example.com',
                fullname: 'Different User',
                pass: 'hashedPassword',
                tasks: [],
            };
            const taskWithDifferentOwner = {
                ...mockTask,
                owner: differentOwner,
            };
            const result = TaskMapper.toResponseDto(taskWithDifferentOwner);

            expect(result.owner).toEqual({
                id: differentOwner.id,
                email: differentOwner.email,
                fullname: differentOwner.fullname,
            });
        });

        it('should handle task with empty description', () => {
            const taskWithEmptyDescription = { ...mockTask, description: '' };
            const result = TaskMapper.toResponseDto(taskWithEmptyDescription);

            expect(result.description).toBe('');
        });

        it('should handle task with long title', () => {
            const longTitle = 'A'.repeat(1000);
            const taskWithLongTitle = { ...mockTask, title: longTitle };
            const result = TaskMapper.toResponseDto(taskWithLongTitle);

            expect(result.title).toBe(longTitle);
        });
    });

    describe('toResponseDtoList', () => {
        it('should map array of task entities to response DTOs', () => {
            const tasks = [mockTask, { ...mockTask, id: 'second-task-id' }];
            const result = TaskMapper.toResponseDtoList(tasks);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(TaskMapper.toResponseDto(mockTask));
            expect(result[1]).toEqual(TaskMapper.toResponseDto(tasks[1]));
        });

        it('should handle empty array', () => {
            const result = TaskMapper.toResponseDtoList([]);

            expect(result).toEqual([]);
        });

        it('should handle single task array', () => {
            const result = TaskMapper.toResponseDtoList([mockTask]);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(TaskMapper.toResponseDto(mockTask));
        });

        it('should handle array with mixed task states', () => {
            const doneTask = { ...mockTask, id: 'done-task-id', done: true };
            const pendingTask = {
                ...mockTask,
                id: 'pending-task-id',
                done: false,
            };
            const tasks = [doneTask, pendingTask];
            const result = TaskMapper.toResponseDtoList(tasks);

            expect(result).toHaveLength(2);
            expect(result[0].done).toBe(true);
            expect(result[1].done).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle task with null description', () => {
            const taskWithNullDescription = {
                ...mockTask,
                description: null as any,
            };
            const result = TaskMapper.toResponseDto(taskWithNullDescription);

            expect(result.description).toBeNull();
        });

        it('should handle task with undefined description', () => {
            const taskWithUndefinedDescription = {
                ...mockTask,
                description: undefined as any,
            };
            const result = TaskMapper.toResponseDto(
                taskWithUndefinedDescription,
            );

            expect(result.description).toBeUndefined();
        });

        it('should handle task with null owner', () => {
            const taskWithNullOwner = { ...mockTask, owner: null as any };
            const result = TaskMapper.toResponseDto(taskWithNullOwner);

            expect(result.owner).toBeNull();
        });

        it('should handle task with undefined owner', () => {
            const taskWithUndefinedOwner = {
                ...mockTask,
                owner: undefined as any,
            };
            const result = TaskMapper.toResponseDto(taskWithUndefinedOwner);

            expect(result.owner).toBeUndefined();
        });
    });
});
