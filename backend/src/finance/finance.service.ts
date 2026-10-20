import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';

@Injectable()
export class FinanceService {
    constructor(@InjectModel(Transaction.name) private transactionModel: Model<Transaction>) {}

    // Додавання транзакції
    async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
        const newTransaction = new this.transactionModel({
            ...dto,
            userId,
        });
        return newTransaction.save();
    }

    // Отримання всіх транзакцій користувача
    async findAll(userId: string): Promise<Transaction[]> {
        return this.transactionModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    // Підрахунок балансу (Доходи, Витрати, Залишок)
    async getSummary(userId: string) {
        const transactions = await this.findAll(userId);

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    }

    // Видалення транзакції
    async remove(id: string, userId: string): Promise<void> {
        const result = await this.transactionModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        }
    }
}