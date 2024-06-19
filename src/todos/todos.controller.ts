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
import { TODOS_ROUTE } from 'src/common/constants/routing.constants'
import type { Todo } from './schemas/todos.schema'

@Controller(TODOS_ROUTE)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() todo: Todo): Promise<Todo> {
    return await this.todosService.create(todo)
  }

  @Get()
  async getAll(): Promise<Todo[]> {
    return await this.todosService.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Todo> {
    return await this.todosService.getById(id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() newParams: Partial<Todo>,
  ): Promise<Todo> {
    return await this.todosService.update(id, newParams)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.todosService.delete(id)
  }
}
