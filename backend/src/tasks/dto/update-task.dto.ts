import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from '../schemas/task.schema.js';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Назва завдання не може бути порожньою' })
    title?: string;

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
    @IsEnum(TaskStatus, { message: 'Некоректний статус завдання (дозволено: NEW, IN_PROGRESS, DONE)' })
    status?: TaskStatus;
}