import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
    static toResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            tasks: user.tasks ?? null,
        };
    }

    static toResponseDtoList(users: User[]): UserResponseDto[] {
        return users.map((user) => this.toResponseDto(user));
    }
}
