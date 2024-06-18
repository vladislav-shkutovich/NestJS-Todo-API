import { Injectable } from '@nestjs/common'
import { TodosDatabaseService } from './todos.database.service'
import type { Todo } from './schemas/todos.schema'

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  async create(todoItem: Todo): Promise<Todo> {
    return this.todosDatabaseService.create(todoItem)
  }

  async getAll(): Promise<Todo[]> {
    return this.todosDatabaseService.getAll()
  }

  async getById(id: string): Promise<Todo> {
    return this.todosDatabaseService.getById(id)
  }

  async update(id: string, newParams: Partial<Todo>): Promise<Todo> {
    return this.todosDatabaseService.update(id, newParams)
  }

  async delete(id: string): Promise<Todo> {
    return this.todosDatabaseService.delete(id)
  }
}
