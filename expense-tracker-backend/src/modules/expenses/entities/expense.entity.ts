import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: ['Food', 'Travel', 'Bills', 'Shopping'],
  })
  category: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  note: string;

  // Har expense kis user ka hai - login user se link hota hai
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
