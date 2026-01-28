import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class User {
  @Prop({
    default: () => `user-${uuidv4()}`,
    unique: true,
    index: true,
    immutable: true,
  }) // index is used to help MongoDB quickly find the targeted data, while immutable is used to ensuring that data will never could change once created
  uuid: string;

  @Prop({ unique: true, required: true, trim: true }) // trim is used to remove any space in the beginning and the end of the username
  username: string;

  @Prop({ required: true, select: false }) // select=false it will return no password while querying, we can select=true password explicitly in service
  password: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] }) // enum will give order to MongoDB that only user or admin value allowed
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ uuid: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true }); // this syntax of code will force Mongoose to ensuring that data not duplicated

// virtual populate used for relation to books have been written
UserSchema.virtual('books', {
  // the 'books' above will give you the field 'books' in response later
  ref: 'Book', // it came from: export const BookSchema = SchemaFactory.createForClass(Book);
  localField: '_id', // it came from current _id user logged in (local)
  foreignField: 'author', // it came from author: mongoose.Types.ObjectId | User; in book.schema.ts
});

// enabling virtual above in response later
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
