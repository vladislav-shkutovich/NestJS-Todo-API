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

  @Prop({ required: true })
  userId: Types.ObjectId

  createdAt: Date

  updatedAt: Date
}

export const TodoSchema = SchemaFactory.createForClass(Todo)

// ? Question: is it an acceptable way to attach indexes here?
TodoSchema.index({ userId: 1 })
