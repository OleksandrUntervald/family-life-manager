import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Автоматично додасть дату створення (createdAt)
export class Workout extends Document {
    @Prop({ required: true })
    title: string; // Наприклад: "Жим лежачи", "Присідання"

    @Prop({ required: true })
    weight: number; // Вага в кг

    @Prop({ required: true })
    reps: number; // Кількість повторень

    @Prop({ required: true })
    sets: number; // Кількість підходів

    @Prop({ type: Date, default: Date.now })
    date: Date;

    // Найголовніше: зв'язок запису з конкретним юзером
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);