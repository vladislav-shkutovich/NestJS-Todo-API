import { Injectable } from '@nestjs/common'
import { TodosDatabaseService } from './todos.database.service'
import type { TodoItem } from 'types/todos'

@Injectable()
export class TodosService {
  constructor(private readonly todosDatabaseService: TodosDatabaseService) {}

  create(todoItem: TodoItem): TodoItem {
    return this.todosDatabaseService.create(todoItem)
  }

  getAll(): TodoItem[] {
    return this.todosDatabaseService.getAll()
  }

  getById(id: string): TodoItem {
    return this.todosDatabaseService.getById(id)
  }

  update(id: string, newParams: Partial<TodoItem>): TodoItem {
    return this.todosDatabaseService.update(id, newParams)
  }

  delete(id: string): TodoItem {
    return this.todosDatabaseService.delete(id)
  }
}
