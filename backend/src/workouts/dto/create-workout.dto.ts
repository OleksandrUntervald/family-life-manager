import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateWorkoutDto {
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Назва тренування не може бути порожньою' })
    title: string;

    @Type(() => Number)
    @IsNumber({}, { message: 'Вага має бути числом' })
    @Min(0, { message: 'Вага не може бути від\'ємною' })
    weight: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'Кількість повторень має бути числом' })
    @Min(1, { message: 'Мінімум 1 повторення' })
    reps: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'Кількість підходів має бути числом' })
    @Min(1, { message: 'Мінімум 1 підхід' })
    sets: number;

    @IsOptional()
    @IsString()
    date?: string;
}