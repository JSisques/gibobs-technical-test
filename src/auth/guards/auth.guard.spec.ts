import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let mockJwtService: jest.Mocked<JwtService>;
    let mockReflector: jest.Mocked<Reflector>;

    beforeEach(() => {
        mockJwtService = {
            verifyAsync: jest.fn(),
        } as any;

        mockReflector = {
            getAllAndOverride: jest.fn(),
        } as any;

        guard = new AuthGuard(mockJwtService, mockReflector);
    });

    describe('canActivate', () => {
        it('should return true for public routes', async () => {
            const mockContext = {
                getHandler: () => ({}),
                getClass: () => ({}),
            } as unknown as ExecutionContext;

            mockReflector.getAllAndOverride.mockReturnValue(true);

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
        });

        it('should return true when valid token is provided', async () => {
            const mockUser = { id: 'user-id', email: 'test@example.com' };
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);
            mockJwtService.verifyAsync.mockResolvedValue(mockUser);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(mockRequest['user']).toEqual(mockUser);
            expect(result).toBe(true);
        });

        it('should throw UnauthorizedException when no authorization header', async () => {
            const mockRequest = {
                headers: {},
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when authorization header is malformed', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'InvalidFormat token',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when authorization header is empty', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer ',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when JWT verification fails', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer invalid-token',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);
            mockJwtService.verifyAsync.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
                'invalid-token',
            );
        });

        it('should handle different authorization header formats', async () => {
            const mockUser = { id: 'user-id', email: 'test@example.com' };
            const mockRequest = {
                headers: {
                    authorization: 'bearer valid-token',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);
            mockJwtService.verifyAsync.mockResolvedValue(mockUser);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(mockRequest['user']).toEqual(mockUser);
            expect(result).toBe(true);
        });

        it('should handle authorization header with extra spaces', async () => {
            const mockUser = { id: 'user-id', email: 'test@example.com' };
            const mockRequest = {
                headers: {
                    authorization: '  Bearer  valid-token  ',
                },
            };

            mockReflector.getAllAndOverride.mockReturnValue(false);
            mockJwtService.verifyAsync.mockResolvedValue(mockUser);

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
                'valid-token',
            );
            expect(mockRequest['user']).toEqual(mockUser);
            expect(result).toBe(true);
        });
    });
});
