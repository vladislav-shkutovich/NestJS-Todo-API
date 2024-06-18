import { Injectable } from '@nestjs/common'
import { TodosDatabaseService } from './todos.database.service'
import type { TodoItem } from './schemas/todos.schema'

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  async create(todoItem: TodoItem): Promise<TodoItem> {
    return this.todosDatabaseService.create(todoItem)
  }

  async getAll(): Promise<TodoItem[]> {
    return this.todosDatabaseService.getAll()
  }

  async getById(id: string): Promise<TodoItem> {
    return this.todosDatabaseService.getById(id)
  }

  async update(id: string, newParams: Partial<TodoItem>): Promise<TodoItem> {
    return this.todosDatabaseService.update(id, newParams)
  }

  async delete(id: string): Promise<TodoItem> {
    return this.todosDatabaseService.delete(id)
  }
}
