import { IsNotEmpty, IsNumber, IsString, Min, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHealthDto {
    @IsString()
    @IsNotEmpty({ message: 'Дата обов’язкова' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата має бути у форматі YYYY-MM-DD' })
    date: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    consumedCalories?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    steps?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    weight?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    water?: number;
}