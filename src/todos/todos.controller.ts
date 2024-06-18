import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'

import { TodosService } from './todos.service'
import type { TodoItem } from './schemas/todos.schema'

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() todo: TodoItem): Promise<TodoItem> {
    return this.todosService.create(todo)
  }

  @Get()
  async getAll(): Promise<TodoItem[]> {
    return this.todosService.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TodoItem> {
    return this.todosService.getById(id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() newParams: Partial<TodoItem>,
  ): Promise<TodoItem> {
    return this.todosService.update(id, newParams)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<TodoItem> {
    return this.todosService.delete(id)
  }
}
