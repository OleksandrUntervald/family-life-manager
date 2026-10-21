import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateEquipmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsEnum(['car', 'home', 'other'])
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