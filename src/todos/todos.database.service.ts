import { Injectable, NotFoundException } from '@nestjs/common'
import { initialTodos } from 'mocks/todos'
import { TodoItem } from 'types/todos'

@Injectable()
export class TodosDatabaseService {
  static todos: TodoItem[] = initialTodos

  private findIndexById(id: string): number {
    const todoIndex = TodosDatabaseService.todos.findIndex(
      (todo) => todo.id === id,
    )

    if (todoIndex === -1) {
      throw new NotFoundException(`TodoItem with id ${id} not found`)
    }

    return todoIndex
  }

  create(todoItem: TodoItem): TodoItem {
    TodosDatabaseService.todos.push(todoItem)
    return todoItem
  }

  getAll(): TodoItem[] {
    return TodosDatabaseService.todos
  }

  getById(id: string): TodoItem {
    const todoIndex = this.findIndexById(id)
    return TodosDatabaseService.todos[todoIndex]
  }

  update(id: string, newParams: Partial<TodoItem>): TodoItem {
    const todoIndex = this.findIndexById(id)

    const updatedTodo = {
      ...TodosDatabaseService.todos[todoIndex],
      ...newParams,
    }
    TodosDatabaseService.todos[todoIndex] = updatedTodo

    return updatedTodo
  }

  delete(id: string): TodoItem {
    const todoIndex = this.findIndexById(id)

    const [deletedTodo] = TodosDatabaseService.todos.splice(todoIndex, 1)

    return deletedTodo
  }
}
