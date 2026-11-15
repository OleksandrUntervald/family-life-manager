import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransactionType } from '../schemas/transaction.schema.js';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty({ message: 'Назва транзакції обов’язкова' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    title: string;

    @Type(() => Number)
    @IsNumber({}, { message: 'Сума має бути числом' })
    @Min(0.01, { message: 'Сума має бути більшою за 0' })
    amount: number;

    @IsEnum(TransactionType, { message: 'Некоректний тип транзакції (income або expense)' })
    type: TransactionType;

    @IsString()
    @IsNotEmpty({ message: 'Категорія обов’язкова' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    category: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isShared?: boolean;
}