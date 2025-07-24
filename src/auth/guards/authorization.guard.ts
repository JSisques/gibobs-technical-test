import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenResourceException } from '../../common/exceptions/forbidden-resource.exception';
import { UnauthorizedActionException } from '../../common/exceptions/unauthorized-action.exception';
import { SKIP_AUTHORIZATION_KEY } from '../decorators/skip-authorization.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    private readonly logger = new Logger(AuthorizationGuard.name);

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skipAuthorization = this.reflector.getAllAndOverride<boolean>(
            SKIP_AUTHORIZATION_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Skip authorization if the decorator is present
        if (skipAuthorization) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;

        // If no user is authenticated, let the AuthGuard handle it
        if (!user) {
            return true;
        }

        const userId = user.id;
        const resourceId = params.id;
        const resourceType = this.getResourceTypeFromPath(request.url);

        // For tasks, we need to check ownership instead of direct ID comparison
        if (resourceType === 'task' && resourceId) {
            return true;
        }

        if (resourceId && userId !== resourceId) {
            const method = request.method;
            const action = this.getActionFromMethod(method);

            this.logger.warn(
                `Unauthorized access attempt: User ${userId} trying to ${action} ${resourceType} ${resourceId}`,
            );

            if (method === 'GET') {
                throw new ForbiddenResourceException(resourceType);
            } else {
                throw new UnauthorizedActionException(
                    action,
                    resourceType,
                    resourceId,
                    userId,
                );
            }
        }

        return true;
    }

    private getResourceTypeFromPath(path: string): string {
        if (path.includes('/users')) {
            return 'user';
        }
        if (path.includes('/tasks')) {
            return 'task';
        }
        return 'resource';
    }

    private getActionFromMethod(method: string): string {
        switch (method) {
            case 'GET':
                return 'access';
            case 'POST':
                return 'create';
            case 'PATCH':
            case 'PUT':
                return 'update';
            case 'DELETE':
                return 'delete';
            default:
                return 'perform action on';
        }
    }
}
