import { Injectable } from '@nestjs/common'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosDatabaseService.create(createTodoDto)
  }

  async getAll(): Promise<Todo[]> {
    return await this.todosDatabaseService.getAll()
  }

  async getById(id: string): Promise<Todo> {
    return await this.todosDatabaseService.getById(id)
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return await this.todosDatabaseService.update(id, updateTodoDto)
  }

  async delete(id: string): Promise<void> {
    await this.todosDatabaseService.delete(id)
  }
}
