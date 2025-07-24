import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ForbiddenResourceException } from '../exceptions/forbidden-resource.exception';
import { InsufficientPermissionsException } from '../exceptions/insufficient-permissions.exception';
import { UnauthorizedActionException } from '../exceptions/unauthorized-action.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let isSecurityEvent = false;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                'message' in exceptionResponse
            ) {
                message = Array.isArray(exceptionResponse.message)
                    ? exceptionResponse.message[0]
                    : exceptionResponse.message;
            }

            // Check if this is a security-related exception
            if (
                exception instanceof ForbiddenResourceException ||
                exception instanceof UnauthorizedActionException ||
                exception instanceof InsufficientPermissionsException ||
                status === HttpStatus.FORBIDDEN ||
                status === HttpStatus.UNAUTHORIZED
            ) {
                isSecurityEvent = true;
            }
        }

        // Enhanced logging for security events
        if (isSecurityEvent) {
            const userId = request['user']?.id || 'unknown';
            const userAgent = request.headers['user-agent'] || 'unknown';
            const ip =
                request.ip || request.connection.remoteAddress || 'unknown';

            this.logger.warn(
                `SECURITY EVENT: ${status} - ${message} - User: ${userId} - IP: ${ip} - UA: ${userAgent} - ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        } else {
            this.logger.error(
                `HTTP Exception: ${status} - ${message} - ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}
