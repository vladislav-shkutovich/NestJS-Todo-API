import { Schema, Document } from 'mongoose'

export const TodoItemSchema = new Schema({
  title: { type: String, required: true },
  description: String,
})

export interface TodoItem extends Document {
  title: string
  description?: string
}
