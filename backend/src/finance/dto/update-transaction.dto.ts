import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransactionType } from '../schemas/transaction.schema.js';

export class UpdateTransactionDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    title?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Сума має бути числом' })
    @Min(0.01, { message: 'Сума має бути більшою за 0' })
    amount?: number;

    @IsOptional()
    @IsEnum(TransactionType, { message: 'Некоректний тип транзакції' })
    type?: TransactionType;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    category?: string;
}