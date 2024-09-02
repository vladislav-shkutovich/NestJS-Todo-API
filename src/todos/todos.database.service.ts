import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { TODO_MODEL } from '../common/constants/database.constants'
import { QueryParamsDto } from '../common/dto/query-params.dto'
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
      userId: new Types.ObjectId(userId),
      ...createTodoDto,
    })
    return createdTodo.toObject()
  }

  async getAllTodos(): Promise<Todo[]> {
    return await this.todoModel.find().lean()
  }

  async getAllTodosByUserId(
    userId: Types.ObjectId,
    options: QueryParamsDto<Todo> = {},
  ): Promise<Todo[]> {
    return await this.todoModel.find({ userId }, null, options).lean()
  }

  async getTodoById(id: Types.ObjectId): Promise<Todo> {
    const todoById = await this.todoModel.findById(id).lean()

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById
  }

  async updateTodo(
    todoId: Types.ObjectId,
    userId: Types.ObjectId,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(
        todoId,
        { userId: new Types.ObjectId(userId), ...updateTodoDto },
        {
          new: true,
        },
      )
      .lean()

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${todoId} not found`)
    }

    return updatedTodo
  }

  async deleteTodo(id: Types.ObjectId): Promise<void> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }

  async deleteTodosByQuery(query: Partial<Todo>) {
    await this.todoModel.deleteMany(query)
  }
}
