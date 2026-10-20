import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Health extends Document {
    @Prop({ required: true })
    date: string; // Формат "YYYY-MM-DD"

    @Prop({ default: 0 })
    consumedCalories: number; // Скільки з'їдено

    @Prop({ default: 0 })
    steps: number; // Пройдені кроки

    @Prop({ default: 0 })
    weight: number; // Поточна вага

    @Prop({ default: 0 })
    water: number; // Випита вода (мл)

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const HealthSchema = SchemaFactory.createForClass(Health);
HealthSchema.index({ userId: 1, date: 1 }, { unique: true });