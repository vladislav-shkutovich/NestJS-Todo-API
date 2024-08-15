import { Injectable } from '@nestjs/common'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'

// ? deferred TODO: - Bugfix: add checking if user exist for todo create and update phases;
// Details: User can create todo with non-existing userId

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  async createTodo(createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosDatabaseService.createTodo(createTodoDto)
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
