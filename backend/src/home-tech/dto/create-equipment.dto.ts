import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEquipmentDto {
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Назва обладнання обов’язкова' })
    name: string;

    @IsString()
    @IsEnum(['car', 'home', 'other'], { message: 'Некоректна категорія (car, home, other)' })
    category: string;

    @IsOptional()
    @IsString()
    lastServiceDate?: string;

    @IsOptional()
    @IsString()
    nextServiceDate?: string;

    @IsOptional()
    @IsString()
    mileageOrNote?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}