import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
    USER = 'user',
    PREMIUM = 'premium',
    MANAGER = 'manager',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
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

    // ДОДАНО: Прив'язка до родини (замість teams)
    @Prop({ type: Types.ObjectId, ref: 'Family', default: null })
    familyId: Types.ObjectId;

    // Базові фізичні параметри для формул здоров'я
    @Prop({ default: 170 })
    height: number;

    @Prop({ default: 30 })
    age: number;

    @Prop({ default: 'male' })
    gender: string;

    @Prop({ default: 70 })
    targetWeight: number;
}

export const UserSchema = SchemaFactory.createForClass(User);