import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class FinanceService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    // Хелпер для визначення правильного запиту до БД (особисті чи сімейні)
    private getQueryFilter(userId: string, user: any, isShared: boolean) {
        if (isShared) {
            if (!user?.familyId) return { _id: null }; // Якщо немає родини, повертаємо порожнечу
            return { familyId: user.familyId, isShared: true };
        } else {
            return { userId, isShared: { $ne: true } };
        }
    }

    async create(userId: string, dto: any): Promise<Transaction> {
        const user = await this.userModel.findById(userId);
        let familyId = null;

        if (dto.isShared) {
            if (!user?.familyId) throw new BadRequestException('Ви не перебуваєте в родині, щоб створювати спільні транзакції');
            familyId = user.familyId;
        }

        const newTransaction = new this.transactionModel({
            ...dto,
            userId,
            familyId,
        });
        return newTransaction.save();
    }

    async findAll(
        userId: string, page: number = 1, limit: number = 10,
        sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc',
        type?: string, category?: string, isShared: boolean = false
    ) {
        const user = await this.userModel.findById(userId);
        const query: any = this.getQueryFilter(userId, user, isShared);

        if (type && type !== 'all') query.type = type;
        if (category) query.category = { $regex: category, $options: 'i' };

        const skip = (page - 1) * limit;
        const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            this.transactionModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
            this.transactionModel.countDocuments(query).exec()
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
        };
    }

    async getSummary(userId: string, isShared: boolean = false) {
        const user = await this.userModel.findById(userId);
        const query = this.getQueryFilter(userId, user, isShared);

        const transactions = await this.transactionModel.find(query).exec();

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    }

    async remove(id: string, userId: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const result = await this.transactionModel.deleteOne(query).exec();
        if (result.deletedCount === 0) throw new NotFoundException('Транзакцію не знайдено або немає доступу');
    }

    async updateTransaction(userId: string, id: string, updateData: any) {
        const user = await this.userModel.findById(userId);
        const query = user?.familyId
            ? { _id: id, $or: [{ userId }, { familyId: user.familyId, isShared: true }] }
            : { _id: id, userId };

        const updatedTransaction = await this.transactionModel.findOneAndUpdate(
            query, { $set: updateData }, { new: true }
        ).exec();

        if (!updatedTransaction) throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        return updatedTransaction;
    }
}