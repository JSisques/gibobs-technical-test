import { Task } from '../../tasks/entities/task.entity';
import { User } from '../entities/user.entity';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
    const mockTask: Task = {
        id: 'test-task-id',
        title: 'Test Task',
        description: 'Test Description',
        done: false,
        dueDate: '2024-12-31T23:59:59.000Z',
        owner: null as any,
    };

    const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'hashedPassword',
        tasks: [mockTask],
    };

    describe('toResponseDto', () => {
        it('should map user entity to response DTO', () => {
            const result = UserMapper.toResponseDto(mockUser);

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                fullname: mockUser.fullname,
                tasks: mockUser.tasks,
            });
        });

        it('should handle user with no tasks', () => {
            const userWithNoTasks = { ...mockUser, tasks: [] };
            const result = UserMapper.toResponseDto(userWithNoTasks);

            expect(result.tasks).toEqual([]);
        });

        it('should handle user with multiple tasks', () => {
            const secondTask = { ...mockTask, id: 'second-task-id' };
            const userWithMultipleTasks = {
                ...mockUser,
                tasks: [mockTask, secondTask],
            };
            const result = UserMapper.toResponseDto(userWithMultipleTasks);

            expect(result.tasks).toHaveLength(2);
            expect(result.tasks[0]).toEqual(mockTask);
            expect(result.tasks[1]).toEqual(secondTask);
        });

        it('should handle user with different email', () => {
            const userWithDifferentEmail = {
                ...mockUser,
                email: 'different@example.com',
            };
            const result = UserMapper.toResponseDto(userWithDifferentEmail);

            expect(result.email).toBe('different@example.com');
        });

        it('should handle user with different fullname', () => {
            const userWithDifferentFullname = {
                ...mockUser,
                fullname: 'Different User',
            };
            const result = UserMapper.toResponseDto(userWithDifferentFullname);

            expect(result.fullname).toBe('Different User');
        });

        it('should handle user with long fullname', () => {
            const longFullname = 'A'.repeat(1000);
            const userWithLongFullname = {
                ...mockUser,
                fullname: longFullname,
            };
            const result = UserMapper.toResponseDto(userWithLongFullname);

            expect(result.fullname).toBe(longFullname);
        });
    });

    describe('toResponseDtoList', () => {
        it('should map array of user entities to response DTOs', () => {
            const users = [mockUser, { ...mockUser, id: 'second-user-id' }];
            const result = UserMapper.toResponseDtoList(users);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(UserMapper.toResponseDto(mockUser));
            expect(result[1]).toEqual(UserMapper.toResponseDto(users[1]));
        });

        it('should handle empty array', () => {
            const result = UserMapper.toResponseDtoList([]);

            expect(result).toEqual([]);
        });

        it('should handle single user array', () => {
            const result = UserMapper.toResponseDtoList([mockUser]);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(UserMapper.toResponseDto(mockUser));
        });

        it('should handle array with users having different task counts', () => {
            const userWithNoTasks = {
                ...mockUser,
                id: 'no-tasks-user-id',
                tasks: [],
            };
            const userWithMultipleTasks = {
                ...mockUser,
                id: 'multiple-tasks-user-id',
                tasks: [mockTask, { ...mockTask, id: 'second-task-id' }],
            };
            const users = [userWithNoTasks, userWithMultipleTasks];
            const result = UserMapper.toResponseDtoList(users);

            expect(result).toHaveLength(2);
            expect(result[0].tasks).toHaveLength(0);
            expect(result[1].tasks).toHaveLength(2);
        });
    });

    describe('edge cases', () => {
        it('should handle user with null tasks', () => {
            const userWithNullTasks = { ...mockUser, tasks: null as any };
            const result = UserMapper.toResponseDto(userWithNullTasks);

            expect(result.tasks).toBeNull();
        });

        it('should handle user with undefined tasks', () => {
            const userWithUndefinedTasks = {
                ...mockUser,
                tasks: undefined as any,
            };
            const result = UserMapper.toResponseDto(userWithUndefinedTasks);

            expect(result.tasks).toBeNull();
        });

        it('should handle user with null email', () => {
            const userWithNullEmail = { ...mockUser, email: null as any };
            const result = UserMapper.toResponseDto(userWithNullEmail);

            expect(result.email).toBeNull();
        });

        it('should handle user with undefined fullname', () => {
            const userWithUndefinedFullname = {
                ...mockUser,
                fullname: undefined as any,
            };
            const result = UserMapper.toResponseDto(userWithUndefinedFullname);

            expect(result.fullname).toBeUndefined();
        });

        it('should handle user with empty string values', () => {
            const userWithEmptyValues = {
                ...mockUser,
                email: '',
                fullname: '',
            };
            const result = UserMapper.toResponseDto(userWithEmptyValues);

            expect(result.email).toBe('');
            expect(result.fullname).toBe('');
        });
    });
});
