import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from '../schemas/task.schema.js';

export class CreateTaskDto {
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
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
    @IsEnum(TaskStatus, { message: 'Некоректний статус завдання' })
    status?: TaskStatus;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isShared?: boolean;
}