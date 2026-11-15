import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHealthDto {
    @IsString()
    @IsNotEmpty({ message: 'Дата обов’язкова' })
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