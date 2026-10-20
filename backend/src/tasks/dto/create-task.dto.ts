import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'Назва завдання не може бути порожньою' })
    title: string;

    @IsOptional()
    @IsString()
    date?: string;
}