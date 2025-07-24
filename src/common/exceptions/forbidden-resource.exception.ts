import { ForbiddenException } from '@nestjs/common';

export class ForbiddenResourceException extends ForbiddenException {
    constructor(resourceType: string) {
        super(
            `Access denied: You do not have permission to access ${resourceType}`,
        );
    }
}
