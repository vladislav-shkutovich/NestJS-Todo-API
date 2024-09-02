import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'

import { QueryParamsDto } from '../common/dto/query-params.dto'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  async createTodo(
    createTodoDto: CreateTodoDto,
    userId: Types.ObjectId,
  ): Promise<Todo> {
    return await this.todosDatabaseService.createTodo(createTodoDto, userId)
  }

  async getAllTodos(): Promise<Todo[]> {
    return await this.todosDatabaseService.getAllTodos()
  }

  async getAllTodosByUserId(
    userId: Types.ObjectId,
    options?: QueryParamsDto<Todo>,
  ): Promise<Todo[]> {
    return await this.todosDatabaseService.getAllTodosByUserId(userId, options)
  }

  async getTodoById(id: Types.ObjectId): Promise<Todo> {
    return await this.todosDatabaseService.getTodoById(id)
  }

  async updateTodo(
    todoId: Types.ObjectId,
    userId: Types.ObjectId,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.todosDatabaseService.updateTodo(
      todoId,
      userId,
      updateTodoDto,
    )
  }

  async deleteTodo(id: Types.ObjectId): Promise<void> {
    await this.todosDatabaseService.deleteTodo(id)
  }

  async deleteTodosByQuery(query: Partial<Todo>) {
    await this.todosDatabaseService.deleteTodosByQuery(query)
  }
}
