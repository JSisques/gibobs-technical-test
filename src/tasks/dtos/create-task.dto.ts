import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Task title',
        example: 'Complete project documentation',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Task description',
        example: 'Write comprehensive documentation for the API endpoints',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Task completion status',
        example: false,
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    done?: boolean;

    @ApiProperty({
        description: 'Task due date in ISO 8601 format',
        example: '2024-01-15T23:59:59.000Z',
        format: 'date-time',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    dueDate: string;
}
