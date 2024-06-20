import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NotFoundError } from 'src/common/errors/errors'
import { TODO_MODEL } from 'src/common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel(TODO_MODEL) private todoModel: Model<Todo>) {}

  async create(todo: Todo): Promise<Todo> {
    const createdTodo = await new this.todoModel(todo).save()
    return createdTodo.toObject()
  }

  async getAll(): Promise<Todo[]> {
    return await this.todoModel.find()
  }

  async getById(id: string): Promise<Todo> {
    const todoById = await this.todoModel.findById(id)

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById.toObject()
  }

  async update(id: string, newParams: Partial<Todo>): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(id, newParams, {
      new: true,
    })

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return updatedTodo.toObject()
  }

  async delete(id: string): Promise<void> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }
}
