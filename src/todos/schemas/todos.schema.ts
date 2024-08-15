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

TodoSchema.post<TodoDocument>('save', async function (doc: TodoDocument, next) {
  const UserModel: Model<UserDocument> = this.model('User')
  const user = await UserModel.findById(doc.userId)

  if (user) {
    user.todos.push(doc)
    await user.save()
  }

  next()
})

export { TodoSchema }
