import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { Types } from 'mongoose'

import { TODOS_ROUTE } from 'src/common/constants/routing.constants'
import { ValidationError } from 'src/common/errors/errors'
import { TodosService } from './todos.service'
import type { Todo } from './schemas/todos.schema'

@Controller(TODOS_ROUTE)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() todo: any): Promise<Todo> {
    if (
      typeof todo !== 'object' ||
      typeof todo.title !== 'string' ||
      !todo.title.trim()
    ) {
      throw new ValidationError(
        'Invalid todo. Title is required and should be a non-empty string.',
      )
    }

    return await this.todosService.create(todo)
  }

  @Get()
  async getAll(): Promise<Todo[]> {
    return await this.todosService.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: any): Promise<Todo> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError(
        'Invalid id. ID should be a valid MongoDB ObjectId.',
      )
    }

    return await this.todosService.getById(id)
  }

  @Patch(':id')
  async update(@Param('id') id: any, @Body() newParams: any): Promise<Todo> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError(
        'Invalid id. ID should be a valid MongoDB ObjectId.',
      )
    }
    if (
      newParams.title &&
      (typeof newParams.title !== 'string' || !newParams.title.trim())
    ) {
      throw new ValidationError(
        'Invalid title. Title should be a non-empty string.',
      )
    }
    if (newParams.description && typeof newParams.description !== 'string') {
      throw new ValidationError(
        'Invalid description. Description should be a string.',
      )
    }

    return await this.todosService.update(id, newParams)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: any): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError(
        'Invalid id. ID should be a valid MongoDB ObjectId.',
      )
    }

    await this.todosService.delete(id)
  }
}
