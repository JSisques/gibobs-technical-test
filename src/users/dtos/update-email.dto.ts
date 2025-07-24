import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UpdateEmailDto {
    @ApiProperty({
        description: 'New email address for the user',
        example: 'newemail@example.com',
        format: 'email',
        required: true,
    })
    @IsEmail()
    email: string;
}
