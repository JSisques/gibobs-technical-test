import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token for authentication',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        format: 'jwt',
    })
    accessToken: string;

    @ApiProperty({
        description: 'User information',
        type: UserResponseDto,
    })
    user: UserResponseDto;
}
