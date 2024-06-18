import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { TodoItem } from './schemas/todos.schema'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel('TodoItem') private todoModel: Model<TodoItem>) {}

  async create(todo: TodoItem): Promise<TodoItem> {
    try {
      const createdTodo = new this.todoModel(todo)
      return createdTodo.save()
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create todo. ${error}`)
    }
  }

  async getAll(): Promise<TodoItem[]> {
    try {
      return this.todoModel.find().exec()
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get todos. ${error}`)
    }
  }

  async getById(id: string): Promise<TodoItem> {
    try {
      const todo = await this.todoModel.findById(id).exec()
      if (!todo) {
        throw new NotFoundException(`TodoItem with id ${id} not found`)
      }
      return todo
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get todo. ${error}`)
    }
  }

  async update(id: string, newParams: Partial<TodoItem>): Promise<TodoItem> {
    try {
      const updatedTodo = await this.todoModel
        .findByIdAndUpdate(id, newParams, { new: true })
        .exec()
      if (!updatedTodo) {
        throw new NotFoundException(`TodoItem with id ${id} not found`)
      }
      return updatedTodo
    } catch (error) {
      throw new InternalServerErrorException(`Failed to update todo. ${error}`)
    }
  }

  async delete(id: string): Promise<TodoItem> {
    try {
      const deletedTodo = await this.todoModel.findByIdAndDelete(id).exec()
      if (!deletedTodo) {
        throw new NotFoundException(`TodoItem with id ${id} not found`)
      }
      return deletedTodo
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete todo. ${error}`)
    }
  }
}
