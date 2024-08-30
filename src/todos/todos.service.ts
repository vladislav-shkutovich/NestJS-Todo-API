import { Injectable, OnModuleInit } from '@nestjs/common'

import { QueryParamsDto } from '../common/dto/query-params.dto'
import { UserChangeStreamDatabaseService } from '../user/user.change-stream.database.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosService implements OnModuleInit {
  constructor(
    private readonly todosDatabaseService: TodosDatabaseService,
    private readonly userChangeStreamDatabaseService: UserChangeStreamDatabaseService,
  ) {}

  onModuleInit() {
    this.deleteTodosOnUserDelete()
  }

  async createTodo(
    createTodoDto: CreateTodoDto,
    userId: string,
  ): Promise<Todo> {
    return await this.todosDatabaseService.createTodo(createTodoDto, userId)
  }

  async getAllTodos(): Promise<Todo[]> {
    return await this.todosDatabaseService.getAllTodos()
  }

  async getAllTodosByUserId(
    userId: string,
    options?: QueryParamsDto<Todo>,
  ): Promise<Todo[]> {
    return await this.todosDatabaseService.getAllTodosByUserId(userId, options)
  }

  async getTodoById(id: string): Promise<Todo> {
    return await this.todosDatabaseService.getTodoById(id)
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.todosDatabaseService.updateTodo(
      todoId,
      userId,
      updateTodoDto,
    )
  }

  async deleteTodo(id: string): Promise<void> {
    await this.todosDatabaseService.deleteTodo(id)
  }

  async deleteTodosOnUserDelete() {
    for await (const deletedUserId of this.userChangeStreamDatabaseService.subscribeOnUserDelete()) {
      await this.todosDatabaseService.deleteTodosByQuery({
        userId: deletedUserId.toString(),
      })
    }
  }
}
