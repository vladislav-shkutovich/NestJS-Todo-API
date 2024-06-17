import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { resolve } from 'path'
import { readFile, writeFile } from 'node:fs/promises'

import type { TodoItem, Todos } from 'types/todos'

@Injectable()
export class TodosDatabaseService implements OnModuleInit, OnModuleDestroy {
  private static todos: Todos = new Map()

  private readonly todosFilePath: string = resolve(
    __dirname,
    '../../../todos.json',
  )

  async onModuleInit() {
    await this.loadTodosFromFile()
  }

  async onModuleDestroy() {
    await this.saveTodosToFile()
  }

  private async loadTodosFromFile() {
    try {
      const todosFile = await readFile(this.todosFilePath, 'utf8')
      const todos = JSON.parse(todosFile)
      for (const id in todos) {
        if (todos.hasOwnProperty(id)) {
          TodosDatabaseService.todos.set(id, todos[id])
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(`Files loading failed. ${error}.`)
    }
  }

  private async saveTodosToFile() {
    try {
      const todosToJson = JSON.stringify(
        Object.fromEntries(TodosDatabaseService.todos),
      )
      await writeFile(this.todosFilePath, todosToJson, 'utf8')
    } catch (error) {
      throw new InternalServerErrorException(`Files saving failed. ${error}.`)
    }
  }

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
