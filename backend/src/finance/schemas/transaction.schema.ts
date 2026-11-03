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

    @Prop({ required: false })
    receiptUrl: string;

    // ДОДАНО: Поля для гібридної моделі (Родина)
    @Prop({ type: Types.ObjectId, ref: 'Family', default: null })
    familyId: Types.ObjectId;

    @Prop({ default: false })
    isShared: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);