import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsPublic } from '../decorators/is-public.decorator';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({
        summary: 'User login',
        description:
            'Authenticates a user with email and password, returning a JWT access token and user information.',
    })
    @ApiBody({
        type: LoginDto,
        description: 'Login credentials',
    })
    @ApiOkResponse({
        description: 'Login successful',
        type: AuthResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data (email format, required fields, etc.)',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials (email or password incorrect)',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @IsPublic()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.signIn(loginDto.email, loginDto.password);
    }

    @ApiOperation({
        summary: 'User registration',
        description:
            'Creates a new user account and returns a JWT access token along with user information.',
    })
    @ApiBody({
        type: SignUpDto,
        description: 'User registration data',
    })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        type: AuthResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Invalid input data (email format, password requirements, etc.)',
    })
    @ApiConflictResponse({
        description: 'User with this email already exists',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @IsPublic()
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
        return this.authService.signUp(
            signUpDto.email,
            signUpDto.password,
            signUpDto.fullname,
        );
    }
}
