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
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

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

    @Prop({ default: 'UAH' })
    preferredCurrency: string;

    @Prop({
        type: Object,
        default: {
            currency: true,
            quickActions: true,
            activityFeed: true,
            homeTech: false,
        },
    })
    widgetsConfig: Record<string, boolean>;

    @Prop({ select: false })
    resetPasswordToken?: string;

    @Prop({ select: false })
    resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);