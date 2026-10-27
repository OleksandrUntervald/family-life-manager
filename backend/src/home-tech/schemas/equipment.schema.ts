import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Equipment extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ['car', 'home', 'other'] })
    category: string;

    @Prop()
    lastServiceDate: string;

    @Prop()
    nextServiceDate: string;

    @Prop()
    mileageOrNote: string;

    @Prop({ default: '' })
    comment: string;

    // ДОДАНО ПОЛЕ ДЛЯ ФОТО:
    @Prop({ required: false })
    photoUrl: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);