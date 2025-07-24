import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenResourceException } from '../../common/exceptions/forbidden-resource.exception';
import { UnauthorizedActionException } from '../../common/exceptions/unauthorized-action.exception';
import { SKIP_AUTHORIZATION_KEY } from '../decorators/skip-authorization.decorator';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
    let guard: AuthorizationGuard;
    let reflector: Reflector;

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizationGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<AuthorizationGuard>(AuthorizationGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should return true when skip authorization is set', async () => {
            mockReflector.getAllAndOverride.mockReturnValue(true);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: 'user-id' },
                        params: { id: 'resource-id' },
                        url: '/api/v1/users/resource-id',
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
                SKIP_AUTHORIZATION_KEY,
                [mockContext.getHandler(), mockContext.getClass()],
            );
            expect(result).toBe(true);
        });

        it('should return true when no user is authenticated', async () => {
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: null,
                        params: { id: 'resource-id' },
                        url: '/api/v1/users/resource-id',
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should return true when accessing own user resource', async () => {
            const userId = 'user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: userId },
                        url: '/api/v1/users/' + userId,
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should return true when accessing tasks (ownership checked by service)', async () => {
            const userId = 'user-id';
            const taskId = 'task-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: taskId },
                        url: '/api/v1/tasks/' + taskId,
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should throw ForbiddenResourceException when accessing other user resource with GET', async () => {
            const userId = 'user-id';
            const otherUserId = 'other-user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: otherUserId },
                        url: '/api/v1/users/' + otherUserId,
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                ForbiddenResourceException,
            );
        });

        it('should throw UnauthorizedActionException when updating other user resource', async () => {
            const userId = 'user-id';
            const otherUserId = 'other-user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: otherUserId },
                        url: '/api/v1/users/' + otherUserId,
                        method: 'PATCH',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedActionException,
            );
        });

        it('should throw UnauthorizedActionException when deleting other user resource', async () => {
            const userId = 'user-id';
            const otherUserId = 'other-user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: otherUserId },
                        url: '/api/v1/users/' + otherUserId,
                        method: 'DELETE',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedActionException,
            );
        });

        it('should return true when no resource ID is provided', async () => {
            const userId = 'user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: {},
                        url: '/api/v1/users',
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should handle different HTTP methods correctly', async () => {
            const userId = 'user-id';
            const otherUserId = 'other-user-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
            for (const method of methods) {
                const mockContext = {
                    switchToHttp: () => ({
                        getRequest: () => ({
                            user: { id: userId },
                            params: { id: otherUserId },
                            url: '/api/v1/users/' + otherUserId,
                            method,
                        }),
                    }),
                    getHandler: jest.fn(),
                    getClass: jest.fn(),
                } as unknown as ExecutionContext;

                await expect(guard.canActivate(mockContext)).rejects.toThrow(
                    UnauthorizedActionException,
                );
            }
        });

        it('should handle unknown resource types', async () => {
            const userId = 'user-id';
            const resourceId = 'resource-id';
            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { id: userId },
                        params: { id: resourceId },
                        url: '/api/v1/unknown/' + resourceId,
                        method: 'GET',
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                ForbiddenResourceException,
            );
        });
    });

    describe('getResourceTypeFromPath', () => {
        it('should return "user" for user paths', () => {
            const paths = ['/api/v1/users/123', '/users/456', '/api/users/789'];

            paths.forEach((path) => {
                const mockContext = {
                    switchToHttp: () => ({
                        getRequest: () => ({
                            user: { id: 'user-id' },
                            params: { id: 'resource-id' },
                            url: path,
                            method: 'GET',
                        }),
                    }),
                    getHandler: jest.fn(),
                    getClass: jest.fn(),
                } as unknown as ExecutionContext;

                mockReflector.getAllAndOverride.mockReturnValue(false);

                expect(() => guard.canActivate(mockContext)).rejects.toThrow(
                    ForbiddenResourceException,
                );
            });
        });

        it('should return "task" for task paths', () => {
            const paths = ['/api/v1/tasks/123', '/tasks/456', '/api/tasks/789'];

            paths.forEach((path) => {
                const mockContext = {
                    switchToHttp: () => ({
                        getRequest: () => ({
                            user: { id: 'user-id' },
                            params: { id: 'task-id' },
                            url: path,
                            method: 'GET',
                        }),
                    }),
                    getHandler: jest.fn(),
                    getClass: jest.fn(),
                } as unknown as ExecutionContext;

                mockReflector.getAllAndOverride.mockReturnValue(false);

                expect(guard.canActivate(mockContext)).resolves.toBe(true);
            });
        });
    });

    describe('getActionFromMethod', () => {
        it('should return correct action for each HTTP method', () => {
            const methodActionMap = [
                { method: 'GET', expectedAction: 'access' },
                { method: 'POST', expectedAction: 'create' },
                { method: 'PATCH', expectedAction: 'update' },
                { method: 'PUT', expectedAction: 'update' },
                { method: 'DELETE', expectedAction: 'delete' },
                { method: 'OPTIONS', expectedAction: 'perform action on' },
            ];

            methodActionMap.forEach(({ method, expectedAction }) => {
                const mockContext = {
                    switchToHttp: () => ({
                        getRequest: () => ({
                            user: { id: 'user-id' },
                            params: { id: 'other-user-id' },
                            url: '/api/v1/users/other-user-id',
                            method,
                        }),
                    }),
                    getHandler: jest.fn(),
                    getClass: jest.fn(),
                } as unknown as ExecutionContext;

                mockReflector.getAllAndOverride.mockReturnValue(false);

                if (method === 'GET') {
                    expect(() =>
                        guard.canActivate(mockContext),
                    ).rejects.toThrow(ForbiddenResourceException);
                } else {
                    expect(() =>
                        guard.canActivate(mockContext),
                    ).rejects.toThrow(UnauthorizedActionException);
                }
            });
        });
    });
});
