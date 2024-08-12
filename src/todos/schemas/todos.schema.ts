import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TodoDocument = HydratedDocument<Todo>

@Schema({ versionKey: false, timestamps: true })
export class Todo {
  _id: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  // ? Question: is it a correct way to attach refs to the models?
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const TodoSchema = SchemaFactory.createForClass(Todo)

// ? Question: is it an acceptable way to attach indexes here?
TodoSchema.index({ userId: 1 })
