import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../../tasks/entities/task.entity';

export class UserResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    id: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email',
    })
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
    })
    fullname: string;

    @ApiProperty({
        description: 'List of tasks associated with the user',
        type: [Task],
        isArray: true,
    })
    tasks: Task[];
}
