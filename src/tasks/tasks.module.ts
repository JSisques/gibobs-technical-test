import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TasksController } from './controllers/tasks.controller';
import { Task } from './entities/task.entity';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './services/tasks.service';

@Module({
    imports: [TypeOrmModule.forFeature([Task]), AuthModule],
    controllers: [TasksController],
    providers: [TasksService, TasksRepository],
})
export class TasksModule {}
