import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NotFoundError, ValidationError } from 'src/common/errors/errors'
import { TODO_MODEL } from 'src/common/constants/database.constants'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel(TODO_MODEL) private todoModel: Model<Todo>) {}

  async create(todo: Todo): Promise<Todo> {
    if (!todo.title || typeof todo.title !== 'string') {
      throw new ValidationError('Invalid title.')
    }

    const createdTodo = new this.todoModel(todo)

    return await createdTodo.save()
  }

  async getAll(): Promise<Todo[]> {
    return await this.todoModel.find()
  }

  async getById(id: string): Promise<Todo> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid id.')
    }

    const todoById = await this.todoModel.findById(id)

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById
  }

  async update(id: string, newParams: Partial<Todo>): Promise<Todo> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid id.')
    }

    const updatedTodo = await this.todoModel.findByIdAndUpdate(id, newParams, {
      new: true,
    })

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return updatedTodo
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid id.')
    }

    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }
}
