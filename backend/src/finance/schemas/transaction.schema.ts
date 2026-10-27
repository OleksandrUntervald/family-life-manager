import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class Transaction extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: String, enum: TransactionType, required: true })
    type: TransactionType;

    @Prop({ required: true })
    category: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    // ДОДАЛИ НОВЕ ПОЛЕ ДЛЯ ЧЕКА:
    @Prop({ required: false })
    receiptUrl: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);