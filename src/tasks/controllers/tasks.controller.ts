import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthorizationGuard } from '../../auth/guards/authorization.guard';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskListResponseDto } from '../dtos/task-list-response.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskMapper } from '../mappers/task.mapper';
import { TasksService } from '../services/tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(AuthGuard, AuthorizationGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @ApiOperation({
        summary: 'List user tasks',
        description:
            'Retrieves a paginated list of tasks belonging to the authenticated user.',
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number for pagination',
        example: 1,
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'limit',
        description: 'Number of items per page',
        example: 10,
        required: false,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Tasks retrieved successfully',
        type: TaskListResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to access tasks',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Get()
    async listTasks(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Req() req: any,
    ): Promise<TaskListResponseDto> {
        const userId = req.user.id;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;

        const { tasks, total } = await this.tasksService.listTasks(
            pageNum,
            limitNum,
            userId,
        );
        return {
            tasks: TaskMapper.toResponseDtoList(tasks),
            total,
            page: pageNum,
            limit: limitNum,
        };
    }

    @ApiOperation({
        summary: 'Get task by ID',
        description:
            'Retrieves a specific task by its unique identifier. Users can only access their own tasks.',
    })
    @ApiParam({
        name: 'id',
        description: 'Task unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiOkResponse({
        description: 'Task found successfully',
        type: TaskResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid UUID format',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to access this task',
    })
    @ApiNotFoundResponse({
        description: 'Task not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Get('/:id')
    async getTask(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: any,
    ): Promise<TaskResponseDto> {
        const userId = req.user.id;
        const task = await this.tasksService.getTask(id, userId);
        return TaskMapper.toResponseDto(task);
    }

    @ApiOperation({
        summary: 'Create a new task',
        description: 'Creates a new task for the authenticated user.',
    })
    @ApiBody({
        type: CreateTaskDto,
        description: 'Task creation data',
    })
    @ApiCreatedResponse({
        description: 'Task created successfully',
        type: TaskResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data (required fields, date format, etc.)',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to create tasks',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Post()
    async createTask(
        @Body() createTaskDto: CreateTaskDto,
        @Req() req: any,
    ): Promise<TaskResponseDto> {
        const userId = req.user.id;
        const task = await this.tasksService.createTask(createTaskDto, userId);
        return TaskMapper.toResponseDto(task);
    }

    @ApiOperation({
        summary: 'Update task',
        description:
            'Updates an existing task. Users can only update their own tasks. Only provided fields will be updated.',
    })
    @ApiParam({
        name: 'id',
        description: 'Task unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @ApiBody({
        type: UpdateTaskDto,
        description: 'Task update data',
    })
    @ApiOkResponse({
        description: 'Task updated successfully',
        type: TaskResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data (date format, etc.)',
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated',
    })
    @ApiForbiddenResponse({
        description: 'User not authorized to update this task',
    })
    @ApiNotFoundResponse({
        description: 'Task not found',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
    })
    @Patch(':id')
    async editTask(
        @Body() body: UpdateTaskDto,
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: any,
    ): Promise<TaskResponseDto> {
        const userId = req.user.id;
        const task = await this.tasksService.editTask(id, body, userId);
        return TaskMapper.toResponseDto(task);
    }
}
