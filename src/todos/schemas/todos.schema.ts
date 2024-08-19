import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { UserDocument } from '../../user/schemas/user.schema'

export type TodoDocument = HydratedDocument<Todo>

@Schema({ versionKey: false, timestamps: true })
export class Todo {
  _id: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ required: true })
  userId: Types.ObjectId

  createdAt: Date

  updatedAt: Date
}

const TodoSchema = SchemaFactory.createForClass(Todo)

TodoSchema.post<TodoDocument>('save', async function (doc: TodoDocument) {
  const UserModel: Model<UserDocument> = this.model('User')
  const user = await UserModel.findById(doc.userId)

  if (user) {
    user.todos = user.todos.reduce(
      (todos, todo) => {
        if (todos.length < 5) {
          todos.push(todo)
        }
        return todos
      },
      [doc] as Todo[],
    )

    await user.save()
  }
})

TodoSchema.post('findOneAndUpdate', async function (doc: TodoDocument) {
  const UserModel: Model<UserDocument> = doc.$model('User')
  const user = await UserModel.findById(doc.userId)

  if (user) {
    user.todos = user.todos.reduce(
      (todos, todo) => {
        if (todos.length < 5 && !todo._id.equals(doc._id)) {
          todos.push(todo)
        }
        return todos
      },
      [doc] as Todo[],
    )

    await user.save()
  }
})

export { TodoSchema }
