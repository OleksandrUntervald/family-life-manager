import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Equipment extends Document {
    @Prop({ required: true })
    name: string; // Наприклад: "Mazda 3 (Мастило і фільтри)" або "Фільтр Ecosoft"

    @Prop({ required: true, enum: ['car', 'home', 'other'] })
    category: string; // Категорія для зручності

    @Prop()
    lastServiceDate: string; // Дата останнього обслуговування (YYYY-MM-DD)

    @Prop()
    nextServiceDate: string; // Коли робити наступне обслуговування

    @Prop()
    mileageOrNote: string; // Наприклад: "Пробіг 185 000 км" або "Заміна нижніх картриджів"

    @Prop({ default: '' })
    comment: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);