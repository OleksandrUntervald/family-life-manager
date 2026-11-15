import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateWorkoutDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Назва тренування не може бути порожньою' })
    title?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Вага має бути числом' })
    @Min(0, { message: 'Вага не може бути від\'ємною' })
    weight?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Кількість повторень має бути числом' })
    @Min(1, { message: 'Мінімум 1 повторення' })
    reps?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Кількість підходів має бути числом' })
    @Min(1, { message: 'Мінімум 1 підхід' })
    sets?: number;

    @IsOptional()
    @IsString()
    date?: string;
}