import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '../schemas/premium-request.schema.js';

export class UpdatePremiumRequestDto {
    @IsOptional()
    @IsEnum(RequestStatus, { message: 'Некоректний статус заявки' })
    status?: RequestStatus;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    alreadyPaid?: number;

    @IsOptional()
    @IsString()
    plan?: string;
}