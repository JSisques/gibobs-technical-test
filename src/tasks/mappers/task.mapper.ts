import { TaskResponseDto } from '../dtos/task-response.dto';
import { Task } from '../entities/task.entity';

export class TaskMapper {
    static toResponseDto(task: Task): TaskResponseDto {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            done: task.done,
            dueDate: task.dueDate,
            owner: task.owner
                ? {
                      id: task.owner.id,
                      email: task.owner.email,
                      fullname: task.owner.fullname,
                      tasks: [], // Empty array since we don't want circular reference
                  }
                : null,
        };
    }

    static toResponseDtoList(tasks: Task[]): TaskResponseDto[] {
        return tasks.map((task) => this.toResponseDto(task));
    }
}
