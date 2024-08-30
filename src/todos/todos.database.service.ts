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
    userId: string,
  ): Promise<Todo> {
    const createdTodo = await this.todoModel.create({
      // ? Question: It's a temporal fix, but need to discuss a problem with so much conversions from string into ObjectId and back again. I left some paper notes about it, let's discuss it on the next call.
      // ? This topic is also related to the IdParamDto discussion.
      userId: new Types.ObjectId(userId),
      ...createTodoDto,
    })
    return createdTodo.toObject()
  }

  async getAllTodos(): Promise<Todo[]> {
    const allTodos = await this.todoModel.find()
    return allTodos.map((todo) => todo.toObject())
  }

  async getAllTodosByUserId(
    userId: string,
    options: QueryParamsDto<Todo> = {},
  ): Promise<Todo[]> {
    const todosByUser = await this.todoModel.find({ userId }, null, options)
    return todosByUser.map((todo) => todo.toObject())
  }

  async getTodoById(id: string): Promise<Todo> {
    const todoById = await this.todoModel.findById(id)

    if (!todoById) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }

    return todoById.toObject()
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(
      todoId,
      { userId: new Types.ObjectId(userId), ...updateTodoDto },
      {
        new: true,
      },
    )

    if (!updatedTodo) {
      throw new NotFoundError(`Todo with id ${todoId} not found`)
    }

    return updatedTodo.toObject()
  }

  async deleteTodo(id: string): Promise<void> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id)

    if (!deletedTodo) {
      throw new NotFoundError(`Todo with id ${id} not found`)
    }
  }

  async deleteTodosByQuery(query: Partial<Todo>) {
    await this.todoModel.deleteMany(query)
  }
}
