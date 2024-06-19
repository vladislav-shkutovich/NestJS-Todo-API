import { Schema, Document } from 'mongoose'

export const TodoSchema = new Schema({
  title: { type: String, required: true },
  description: String,
})

export interface Todo extends Document {
  _id: string
  title: string
  description?: string
}
