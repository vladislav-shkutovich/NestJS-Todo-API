import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TodoDocument = HydratedDocument<Todo>

@Schema({ versionKey: false })
export class Todo {
  _id: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string
}

export const TodoSchema = SchemaFactory.createForClass(Todo)
