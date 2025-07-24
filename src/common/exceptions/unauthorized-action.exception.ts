import { ForbiddenException } from '@nestjs/common';

export class UnauthorizedActionException extends ForbiddenException {
    constructor(
        action: string,
        resourceType: string,
        resourceId: string,
        userId: string,
    ) {
        super(
            `Action '${action}' denied: User ${userId} does not have permission to ${action} ${resourceType} ${resourceId}`,
        );
    }
}
