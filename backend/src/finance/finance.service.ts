import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class FinanceService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    private getQueryFilter(userId: string, user: User | null, isShared: boolean) {
        if (isShared) {
            if (!user?.familyId) return { _id: null };
            return { familyId: user.familyId, isShared: true };
        }
        return {
            userId: { $in: [userId, new Types.ObjectId(userId)] },
            isShared: { $ne: true },
        };
    }

    async create(
        userId: string,
        dto: CreateTransactionDto,
        file?: UploadedFileType,
    ): Promise<Transaction> {
        const user = await this.userModel.findById(userId);
        let familyId = null;

        if (dto.isShared) {
            if (!user?.familyId) {
                throw new BadRequestException(
                    'Ви не перебуваєте в родині, щоб створювати спільні транзакції',
                );
            }
            familyId = user.familyId;
        }

        let receiptUrl = '';
        if (file) {
            receiptUrl = await this.cloudinaryService.uploadFile(
                file,
                'lifemanager_finance',
            );
        }

        const newTransaction = new this.transactionModel({
            title: dto.title,
            amount: Number(dto.amount),
            type: dto.type,
            category: dto.category,
            isShared: Boolean(dto.isShared),
            ...(receiptUrl && { receiptUrl }),
            userId,
            familyId,
        });
        return newTransaction.save();
    }

    async findAll(
        userId: string,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc',
        type?: string,
        category?: string,
        isShared = false,
    ) {
        const user = await this.userModel.findById(userId);
        const query: Record<string, any> = this.getQueryFilter(
            userId,
            user,
            isShared,
        );

        if (type && type !== 'all') query.type = type;
        if (category) query.category = { $regex: category, $options: 'i' };

        const skip = (page - 1) * limit;
        const sortOptions: Record<string, 1 | -1> = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };

        const [data, total] = await Promise.all([
            this.transactionModel
                .find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.transactionModel.countDocuments(query).exec(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async getSummary(userId: string, isShared = false) {
        const user = await this.userModel.findById(userId);
        const query = this.getQueryFilter(userId, user, isShared);

        const result = await this.transactionModel
            .aggregate([
                { $match: query },
                { $group: { _id: '$type', total: { $sum: '$amount' } } },
            ])
            .exec();

        let totalIncome = 0;
        let totalExpense = 0;

        result.forEach((item) => {
            if (item._id === TransactionType.INCOME) totalIncome = item.total;
            if (item._id === TransactionType.EXPENSE) totalExpense = item.total;
        });

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    }

    async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
        const user = await this.userModel.findById(userId);
        const query = user?.familyId
            ? {
                _id: id,
                $or: [{ userId }, { familyId: user.familyId, isShared: true }],
            }
            : { _id: id, userId };

        const result = await this.transactionModel.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        }
        return { deleted: true };
    }

    async updateTransaction(
        userId: string,
        id: string,
        dto: UpdateTransactionDto,
        file?: UploadedFileType,
    ) {
        const user = await this.userModel.findById(userId);
        const query = user?.familyId
            ? {
                _id: id,
                $or: [{ userId }, { familyId: user.familyId, isShared: true }],
            }
            : { _id: id, userId };

        const updatePayload: Record<string, any> = {};
        if (dto.title !== undefined) updatePayload.title = dto.title;
        if (dto.amount !== undefined) updatePayload.amount = Number(dto.amount);
        if (dto.type !== undefined) updatePayload.type = dto.type;
        if (dto.category !== undefined) updatePayload.category = dto.category;

        if (file) {
            updatePayload.receiptUrl = await this.cloudinaryService.uploadFile(
                file,
                'lifemanager_finance',
            );
        }

        const updatedTransaction = await this.transactionModel
            .findOneAndUpdate(
                query,
                { $set: updatePayload },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updatedTransaction) {
            throw new NotFoundException('Транзакцію не знайдено або немає доступу');
        }
        return updatedTransaction;
    }
}