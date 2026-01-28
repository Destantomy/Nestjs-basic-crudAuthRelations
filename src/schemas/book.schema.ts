import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Book {
  @Prop({
    default: () => `book-${uuidv4()}`,
    unique: true,
    index: true,
    immutable: true,
  })
  uuid: string;

  @Prop({ required: true, unique: true, trim: true })
  title: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author: mongoose.Types.ObjectId | User;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ uuid: 1 }, { unique: true });
BookSchema.index({ title: 1 }, { unique: true });
