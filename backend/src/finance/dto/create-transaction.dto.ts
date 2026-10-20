import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { TransactionType } from '../schemas/transaction.schema.js';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty({ message: 'Назва не може бути порожньою' })
    title: string;

    @IsNumber({}, { message: 'Сума має бути числом' })
    @Min(0.01, { message: 'Сума має бути більше нуля' })
    amount: number;

    @IsEnum(TransactionType, { message: 'Тип має бути income або expense' })
    type: TransactionType;

    @IsString()
    @IsNotEmpty({ message: 'Категорія обовʼязкова' })
    category: string;
}