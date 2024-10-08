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

  @Prop({ required: true, type: [Todo], default: [] })
  todos: Todo[]
}

export const UserSchema = SchemaFactory.createForClass(User)
