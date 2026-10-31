import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema.js';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'Назва завдання не може бути порожньою' })
    title: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    assignedTo?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;
}