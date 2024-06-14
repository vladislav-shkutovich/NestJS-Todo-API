import { Injectable, NotFoundException } from '@nestjs/common'
import { initialTodos } from './mocks'
import type { TodoItem, Todos } from 'types/todos'

@Injectable()
export class TodosDatabaseService {
  static todos: Todos = initialTodos

  create(todoItem: TodoItem): TodoItem {
    TodosDatabaseService.todos.set(todoItem.id, todoItem)
    return todoItem
  }

  getAll(): TodoItem[] {
    return Array.from(TodosDatabaseService.todos.values())
  }

  getById(id: string): TodoItem {
    const todoItem = TodosDatabaseService.todos.get(id)
    if (!todoItem) {
      throw new NotFoundException(`TodoItem with id ${id} not found`)
    }
    return todoItem
  }

  update(id: string, newParams: Partial<TodoItem>): TodoItem {
    const todoItem = this.getById(id)

    const updatedTodo = { ...todoItem, ...newParams }
    TodosDatabaseService.todos.set(id, updatedTodo)

    return updatedTodo
  }

  delete(id: string): TodoItem {
    const todoItem = this.getById(id)
    TodosDatabaseService.todos.delete(id)
    return todoItem
  }
}
