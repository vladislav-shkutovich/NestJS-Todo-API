import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { Todo } from '../../todos/schemas/todos.schema'

export type UserDocument = HydratedDocument<User>

@Schema({ versionKey: false })
export class User {
  _id: Types.ObjectId

  @Prop({ required: true, unique: true })
  username: string

  @Prop({ required: true })
  password: string

  // ! TODO: - Configure setting user's 5-10 recent todos in every User entity;
  @Prop({ required: true, type: [Todo], default: [] })
  todos: Todo[]
}

export const UserSchema = SchemaFactory.createForClass(User)
