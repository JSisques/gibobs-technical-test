import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UserListResponseDto {
    @ApiProperty({
        description: 'Array of users',
        type: [UserResponseDto],
        isArray: true,
    })
    users: UserResponseDto[];

    @ApiProperty({
        description: 'Total number of users',
        example: 25,
        minimum: 0,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
        minimum: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
    })
    limit: number;
}
