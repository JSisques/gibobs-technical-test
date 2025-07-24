import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters recommended)',
        example: 'securePassword123',
        minLength: 6,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    fullname?: string;
}
