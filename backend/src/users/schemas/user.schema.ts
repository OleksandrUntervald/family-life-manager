import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
    USER = 'user',
    SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true }) // Автоматично додасть createdAt та updatedAt
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ default: false })
    isBanned: boolean;

    // Посилання на команди (модуль Teams зробимо пізніше)
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }], default: [] })
    teams: Types.ObjectId[];

    // Базові фізичні параметри для формул здоров'я
    @Prop({ default: 170 })
    height: number; // Зріст

    @Prop({ default: 30 })
    age: number; // Вік

    @Prop({ default: 'male' })
    gender: string; // 'male' або 'female'

    @Prop({ default: 70 })
    targetWeight: number; // Цільова вага (до якої прагнемо)
}

export const UserSchema = SchemaFactory.createForClass(User);