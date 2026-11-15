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

    // ВИПРАВЛЕННЯ: select: false гарантує, що хеш ніколи не полетить на клієнт
    @Prop({ required: true, select: false })
    passwordHash: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ default: false })
    isBanned: boolean;

    @Prop({ default: 0 })
    tokenVersion: number;

    @Prop({ type: Types.ObjectId, ref: 'Family', default: null })
    familyId: Types.ObjectId;

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