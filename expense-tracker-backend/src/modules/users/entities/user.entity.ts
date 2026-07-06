import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed rahega, kabhi plain text save nahi hota

  // Face login ke liye - 128 numbers ka "face fingerprint" (optional, jab tak user enable na kare)
  @Prop({ type: [Number], default: null })
  faceDescriptor: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);
