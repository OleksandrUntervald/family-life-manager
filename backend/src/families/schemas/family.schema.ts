import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Family extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    inviteCode: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    members: Types.ObjectId[];
}

export const FamilySchema = SchemaFactory.createForClass(Family);