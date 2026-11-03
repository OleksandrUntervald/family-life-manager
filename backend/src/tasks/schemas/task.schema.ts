import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

@Schema({ timestamps: true })
export class Task extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ type: String, enum: Object.values(TaskStatus), default: TaskStatus.NEW })
    status: TaskStatus;

    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({ type: String, default: '' })
    notes: string;

    @Prop({ type: String, default: '' })
    assignedTo: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    // ДОДАНО: Поля для гібридної моделі (Родина)
    @Prop({ type: Types.ObjectId, ref: 'Family', default: null })
    familyId: Types.ObjectId;

    @Prop({ default: false })
    isShared: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);