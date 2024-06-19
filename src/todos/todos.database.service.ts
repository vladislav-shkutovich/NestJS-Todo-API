import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { TODO_MODEL } from 'src/common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel(TODO_MODEL) private todoModel: Model<Todo>) {}

  async create(todo: Todo): Promise<Todo> {
    const createdTodo = new this.todoModel(todo)
    return await createdTodo.save()
  }

  async getAll(): Promise<Todo[]> {
    return await this.todoModel.find().exec()
  }

  async getById(id: string): Promise<Todo> {
    return await this.todoModel.findById(id).exec()
  }

  async update(id: string, newParams: Partial<Todo>): Promise<Todo> {
    return await this.todoModel
      .findByIdAndUpdate(id, newParams, { new: true })
      .exec()
  }

  async delete(id: string): Promise<void> {
    await this.todoModel.findByIdAndDelete(id).exec()
  }
}
