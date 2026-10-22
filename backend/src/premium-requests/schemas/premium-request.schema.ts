import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RequestStatus {
    IN_WORK = 'In work',
    NEW = 'New',
    AGREE = 'Agree',
    DISAGREE = 'Disagree',
    DUBBING = 'Dubbing',
}

@Schema({ timestamps: true })
export class PremiumRequest extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    userId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    telegram: string; // Наш аналог поля phone

    @Prop({ default: 'Family Premium PRO' })
    plan: string; // Аналог course (PRO / VIP / Minimal)

    @Prop({ default: 'annual' })
    billingFormat: string; // Аналог course_format (annual / monthly)

    @Prop({ default: RequestStatus.NEW })
    status: string;

    @Prop({ default: 99 })
    sum: number;

    @Prop({ default: 0 })
    alreadyPaid: number;

    @Prop({ default: null, type: String })
    manager: string | null;

    @Prop({ default: '' })
    comment: string;
}

export const PremiumRequestSchema = SchemaFactory.createForClass(PremiumRequest);