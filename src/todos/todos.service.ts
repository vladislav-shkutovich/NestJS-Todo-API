import { Injectable } from '@nestjs/common'
import { Types } from 'mongoose'

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

  async getAllTodosByUserId(userId: string): Promise<Todo[]> {
    return await this.todosDatabaseService.getAllTodosByUserId(userId)
  }

  async getTodoById(id: string): Promise<Todo> {
    return await this.todosDatabaseService.getTodoById(id)
  }

  async updateTodo(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return await this.todosDatabaseService.updateTodo(id, updateTodoDto)
  }

  async deleteTodo(id: string): Promise<void> {
    await this.todosDatabaseService.deleteTodo(id)
  }
}
