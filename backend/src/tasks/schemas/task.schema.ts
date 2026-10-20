import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);