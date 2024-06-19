import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes } from 'mongoose'

export type TodoDocument = HydratedDocument<Todo>

@Schema()
export class Todo {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: string

  @Prop({ required: true })
  title: string

  @Prop()
  description: string
}

export const TodoSchema = SchemaFactory.createForClass(Todo)
