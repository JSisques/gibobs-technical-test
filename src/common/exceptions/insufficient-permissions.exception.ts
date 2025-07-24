import { ForbiddenException } from '@nestjs/common';

export class InsufficientPermissionsException extends ForbiddenException {
    constructor(requiredPermission: string, userId: string) {
        super(
            `Insufficient permissions: User ${userId} does not have the required permission '${requiredPermission}'`,
        );
    }
}
