import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';

@Injectable()
export class FinanceService {
    constructor(@InjectModel(Transaction.name) private transactionModel: Model<Transaction>) {}

    async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
        const newTransaction = new this.transactionModel({
            ...dto,
            userId,
        });
        return newTransaction.save();
    }

    // ВИПРАВЛЕНО: Додано пагінацію, сортування та фільтрацію
    async findAll(
        userId: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc',
        type?: string,
        category?: string
    ) {
        const query: any = { userId };

        if (type && type !== 'all') {
            query.type = type;
        }

        if (category) {
            // Регістронезалежний пошук за частиною слова
            query.category = { $regex: category, $options: 'i' };
        }

        const skip = (page - 1) * limit;
        const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            this.transactionModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
            this.transactionModel.countDocuments(query).exec()
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        };
    }

    async getSummary(userId: string) {
        // Для балансу завжди рахуємо всі транзакції без пагінації
        const transactions = await this.transactionModel.find({ userId }).exec();

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

    async remove(id: string, userId: string): Promise<void> {
        const result = await this.transactionModel.deleteOne({ _id: id, userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        }
    }

    async updateTransaction(userId: string, id: string, updateData: any) {
        const updatedTransaction = await this.transactionModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true }
        ).exec();

        if (!updatedTransaction) {
            throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        }

        return updatedTransaction;
    }
}