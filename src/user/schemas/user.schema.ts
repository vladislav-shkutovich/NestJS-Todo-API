import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ versionKey: false })
export class User {
  _id: Types.ObjectId

  @Prop({ required: true, unique: true })
  username: string

  @Prop({ required: true })
  password: string
}

export const UserSchema = SchemaFactory.createForClass(User)
