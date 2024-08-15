import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { Todo, TodoDocument } from '../../todos/schemas/todos.schema'

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

const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('todos')) {
    const todoIds = this.todos.map((todo) => todo._id)
    const TodoModel = this.model('Todo') as Model<TodoDocument>
    const recentTodos = await TodoModel.find({ _id: { $in: todoIds } })
      .sort({ createdAt: -1 })
      .limit(5)

    this.todos = recentTodos
  }
  next()
})

export { UserSchema }
