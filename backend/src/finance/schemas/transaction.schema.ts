import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class Transaction extends Document {
    @Prop({ required: true })
    title: string; // Наприклад: "Зарплата", "Заправка авто", "Продукти"

    @Prop({ required: true })
    amount: number; // Сума

    @Prop({ type: String, enum: TransactionType, required: true })
    type: TransactionType; // Дохід чи витрата

    @Prop({ required: true })
    category: string; // Наприклад: "Авто", "Дім", "Робота"

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // Прив'язка до користувача
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);