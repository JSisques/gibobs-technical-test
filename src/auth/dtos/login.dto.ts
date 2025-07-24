import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
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
        description: 'User password',
        example: 'securePassword123',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
