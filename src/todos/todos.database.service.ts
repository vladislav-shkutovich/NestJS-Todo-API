import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { TODO_MODEL } from '../common/constants/database.constants'
import { NotFoundError } from '../common/errors/errors'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosDatabaseService {
  constructor(@InjectModel(TODO_MODEL) private todoModel: Model<Todo>) {}

  async createTodo(
    createTodoDto: CreateTodoDto,
    userId: Types.ObjectId,
  ): Promise<Todo> {
    const createdTodo = await this.todoModel.create({
      userId,
      ...createTodoDto,
    })
    return createdTodo.toObject()
  }

  async getAllTodos(): Promise<Todo[]> {
    const allTodos = await this.todoModel.find()
    return allTodos.map((todo) => todo.toObject())
  }

  // ? deferred TODO: - Add some filters (time range, for example) and sorts for todos by user endpoint;
  async getAllTodosByUserId(userId: string): Promise<Todo[]> {
    const todosByUser = await this.todoModel.find({ userId })
    return todosByUser.map((todo) => todo.toObject())
  }

  async getTodoById(id: string): Promise<Todo> {
    const todoById = await this.todoModel.findById(id)

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById.toObject()
  }

  async updateTodo(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(
      id,
      updateTodoDto,
      {
        new: true,
      },
    )

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return updatedTodo.toObject()
  }

  async deleteTodo(id: string): Promise<void> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }
}
