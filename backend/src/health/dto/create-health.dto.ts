import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CreateHealthDto {
    @IsString()
    @IsNotEmpty()
    date: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    consumedCalories?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    steps?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    weight?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    water?: number;
}