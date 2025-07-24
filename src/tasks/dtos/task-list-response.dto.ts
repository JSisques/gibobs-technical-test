import { ApiProperty } from '@nestjs/swagger';
import { TaskResponseDto } from './task-response.dto';

export class TaskListResponseDto {
    @ApiProperty({
        description: 'Array of tasks',
        type: [TaskResponseDto],
        isArray: true,
    })
    tasks: TaskResponseDto[];

    @ApiProperty({
        description: 'Total number of tasks',
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
