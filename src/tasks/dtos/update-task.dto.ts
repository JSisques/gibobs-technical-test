import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
    @ApiProperty({
        description: 'Task title',
        example: 'Updated project documentation',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'Task description',
        example: 'Updated comprehensive documentation for the API endpoints',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Task completion status',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    done?: boolean;

    @ApiProperty({
        description: 'Task due date in ISO 8601 format',
        example: '2024-01-20T23:59:59.000Z',
        format: 'date-time',
        required: false,
    })
    @IsString()
    @IsOptional()
    dueDate?: string;
}
