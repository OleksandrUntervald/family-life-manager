import {IsNotEmpty, IsNumber, IsOptional, IsString, Min} from 'class-validator';

export class CreateWorkoutDto {
    @IsString()
    @IsNotEmpty({ message: 'Назва тренування не може бути порожньою' })
    title: string;

    @IsNumber({}, { message: 'Вага має бути числом' })
    @Min(0, { message: 'Вага не може бути від\'ємною' })
    weight: number;

    @IsNumber({}, { message: 'Кількість повторень має бути числом' })
    @Min(1, { message: 'Мінімум 1 повторення' })
    reps: number;

    @IsNumber({}, { message: 'Кількість підходів має бути числом' })
    @Min(1, { message: 'Мінімум 1 підхід' })
    sets: number;

    @IsOptional()
    @IsString()
    date?: string;
}