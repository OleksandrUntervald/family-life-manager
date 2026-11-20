import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ActivationKey extends Document {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    usedBy: Types.ObjectId | null;
}

export const ActivationKeySchema = SchemaFactory.createForClass(ActivationKey);