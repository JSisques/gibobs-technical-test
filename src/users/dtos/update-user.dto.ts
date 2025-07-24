import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters recommended)',
        example: 'newSecurePassword123',
        minLength: 6,
        required: false,
    })
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    fullname?: string;
}
