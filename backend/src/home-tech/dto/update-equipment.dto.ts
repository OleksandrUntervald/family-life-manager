import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEquipmentDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'Назва не може бути порожньою' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsEnum(['car', 'home', 'other'], { message: 'Некоректна категорія (car, home, other)' })
    category?: string;

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