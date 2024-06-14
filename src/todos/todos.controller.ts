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
import type { TodoItem } from 'types/todos'

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() todo: TodoItem): TodoItem {
    return this.todosService.create(todo)
  }

  @Get()
  getAll(): TodoItem[] {
    return this.todosService.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): TodoItem {
    return this.todosService.getById(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() newParams: Partial<TodoItem>,
  ): TodoItem {
    return this.todosService.update(id, newParams)
  }

  @Delete(':id')
  delete(@Param('id') id: string): TodoItem {
    return this.todosService.delete(id)
  }
}
