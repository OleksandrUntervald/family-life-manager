import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
    @IsOptional()
    @IsNumber({}, { message: 'Зріст має бути числом' })
    @Min(50, { message: 'Неможливий зріст' })
    @Max(250, { message: 'Неможливий зріст' })
    height?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Вік має бути числом' })
    @Min(1, { message: 'Неможливий вік' })
    age?: number;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Вага має бути числом' })
    @Min(20, { message: 'Неможлива вага' })
    targetWeight?: number;
}