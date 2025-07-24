import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipAuthorization } from '../../auth/decorators/skip-authorization.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthorizationGuard } from '../../auth/guards/authorization.guard';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateEmailDto } from '../dtos/update-email.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, AuthorizationGuard)
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({
        summary: 'Create a new user',
        description:
            'Creates a new user account with email, password, and optional full name. This endpoint skips authorization checks.',
    })
    @ApiBody({
        type: CreateUserDto,
        description: 'User creation data',
    })
    @ApiCreatedResponse({
        description: 'User created successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data (email format, required fields, etc.)',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @SkipAuthorization()
    @Post()
    async create(
        @Body() createUserDto: CreateUserDto,
    ): Promise<UserResponseDto> {
        this.logger.log(`Creating user with email: ${createUserDto.email}`);
        const user = await this.usersService.create(createUserDto);
        return UserMapper.toResponseDto(user);
    }

    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a specific user by their unique identifier.',
    })
    @ApiParam({
        name: 'id',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiOkResponse({
        description: 'User found successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid UUID format',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to access this resource',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<UserResponseDto> {
        this.logger.log(`Finding user with id: ${id}`);
        const user = await this.usersService.findOne(id);
        return UserMapper.toResponseDto(user);
    }

    @ApiOperation({
        summary: 'Update user information',
        description:
            'Updates user information including email, password, and full name. Only provided fields will be updated.',
    })
    @ApiParam({
        name: 'id',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'User update data',
    })
    @ApiOkResponse({
        description: 'User updated successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data (email format, etc.)',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to update this resource',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        this.logger.log(`Updating user with id: ${id}`);
        const user = await this.usersService.update(id, updateUserDto);
        return UserMapper.toResponseDto(user);
    }

    @ApiOperation({
        summary: 'Update user email',
        description: 'Updates only the email address for a specific user.',
    })
    @ApiParam({
        name: 'id',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiBody({
        type: UpdateEmailDto,
        description: 'New email address',
    })
    @ApiOkResponse({
        description: 'Email updated successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid email format',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to update this resource',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Patch(':id/email')
    async updateEmail(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateEmailDto: UpdateEmailDto,
    ): Promise<UserResponseDto> {
        this.logger.log(`Updating email for user with id: ${id}`);
        const user = await this.usersService.updateEmail(id, updateEmailDto);
        return UserMapper.toResponseDto(user);
    }

    @ApiOperation({
        summary: 'Delete user',
        description: 'Permanently deletes a user and all associated data.',
    })
    @ApiParam({
        name: 'id',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiNoContentResponse({
        description: 'User deleted successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid UUID format',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to delete this resource',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        this.logger.log(`Removing user with id: ${id}`);
        return await this.usersService.remove(id);
    }
}
