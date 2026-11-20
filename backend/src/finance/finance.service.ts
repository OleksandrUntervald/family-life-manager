import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionType } from './schemas/transaction.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { Family } from '../families/schemas/family.schema.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UploadedFileType } from '../common/interfaces/uploaded-file.interface.js';
import { escapeRegex } from '../common/utils/escape-regex.util.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { FinanceQueryDto } from './dto/finance-query.dto.js';

@Injectable()
export class FinanceService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Family.name) private familyModel: Model<Family>,
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

    private async assertCanModify(transaction: Transaction, userId: string): Promise<void> {
        const isAuthor = String(transaction.userId) === String(userId);
        if (isAuthor) return;

        if (transaction.isShared && transaction.familyId) {
            const family = await this.familyModel.findById(transaction.familyId).exec();
            if (family && String(family.ownerId) === String(userId)) {
                return;
            }
        }

        throw new ForbiddenException(
            'Редагувати або видаляти спільну транзакцію може лише її автор або власник родини',
        );
    }

    async create(
        userId: string,
        dto: CreateTransactionDto,
        file?: UploadedFileType,
    ): Promise<Transaction> {
        const user = await this.userModel.findById(userId);
        let familyId: Types.ObjectId | null = null;

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
            userId: new Types.ObjectId(userId),
            familyId,
        });
        return newTransaction.save();
    }

    async findAll(userId: string, dto: FinanceQueryDto) {
        const user = await this.userModel.findById(userId);
        const query: Record<string, any> = this.getQueryFilter(
            userId,
            user,
            Boolean(dto.isShared),
        );

        if (dto.type && dto.type !== 'all') query.type = dto.type;
        if (dto.category) {
            query.category = { $regex: escapeRegex(dto.category), $options: 'i' };
        }
        if (dto.minAmount !== undefined || dto.maxAmount !== undefined) {
            query.amount = {};
            if (dto.minAmount !== undefined) query.amount.$gte = dto.minAmount;
            if (dto.maxAmount !== undefined) query.amount.$lte = dto.maxAmount;
        }
        if (dto.dateFrom || dto.dateTo) {
            query.createdAt = {};
            if (dto.dateFrom) query.createdAt.$gte = new Date(dto.dateFrom);
            if (dto.dateTo) {
                const end = new Date(dto.dateTo);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const page = dto.page ?? 1;
        const limit = dto.limit ?? 10;
        const skip = (page - 1) * limit;
        const sortBy = dto.sortBy ?? 'createdAt';
        const sortOrder = dto.sortOrder ?? 'desc';
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
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction) {
            throw new NotFoundException('Транзакцію не знайдено');
        }

        await this.assertCanModify(transaction, userId);
        await this.transactionModel.deleteOne({ _id: transaction._id }).exec();
        return { deleted: true };
    }

    async updateTransaction(
        userId: string,
        id: string,
        dto: UpdateTransactionDto,
        file?: UploadedFileType,
    ) {
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction) {
            throw new NotFoundException('Транзакцію не знайдено');
        }

        await this.assertCanModify(transaction, userId);

        const updatePayload: Record<string, any> = { ...dto };
        if (file) {
            updatePayload.receiptUrl = await this.cloudinaryService.uploadFile(
                file,
                'lifemanager_finance',
            );
        }

        const updatedTransaction = await this.transactionModel
            .findByIdAndUpdate(
                transaction._id,
                { $set: updatePayload },
                { new: true, runValidators: true },
            )
            .exec();

        if (!updatedTransaction) {
            throw new NotFoundException('Транзакцію не знайдено');
        }
        return updatedTransaction;
    }
}