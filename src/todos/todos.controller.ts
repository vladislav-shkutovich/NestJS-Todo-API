import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { TODOS_ROUTE } from 'src/common/constants/routing.constants'
import { TodosService } from './todos.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { IdParamDto } from './dto/id-param.dto'
import type { Todo } from './schemas/todos.schema'

@Controller(TODOS_ROUTE)
@UsePipes(ValidationPipe)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosService.create(createTodoDto)
  }

  @Get()
  async getAll(): Promise<Todo[]> {
    return await this.todosService.getAll()
  }

  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<Todo> {
    return await this.todosService.getById(params.id)
  }

  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.todosService.update(params.id, updateTodoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param() params: IdParamDto): Promise<void> {
    await this.todosService.delete(params.id)
  }
}
