import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/user-response.dto';

export class TaskResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        description: 'Task title',
        example: 'Complete project documentation',
    })
    title: string;

    @ApiProperty({
        description: 'Task description',
        example: 'Write comprehensive documentation for the API endpoints',
    })
    description: string;

    @ApiProperty({
        description: 'Task completion status',
        example: false,
    })
    done: boolean;

    @ApiProperty({
        description: 'Task due date in ISO 8601 format',
        example: '2024-01-15T23:59:59.000Z',
        format: 'date-time',
    })
    dueDate: string;

    @ApiProperty({
        description: 'Task owner information',
        type: UserResponseDto,
    })
    owner: UserResponseDto;

    @ApiProperty({
        description: 'Task creation timestamp',
        example: '2024-01-10T10:30:00.000Z',
        format: 'date-time',
        required: false,
    })
    createdAt?: Date;

    @ApiProperty({
        description: 'Task last update timestamp',
        example: '2024-01-12T15:45:00.000Z',
        format: 'date-time',
        required: false,
    })
    updatedAt?: Date;
}
