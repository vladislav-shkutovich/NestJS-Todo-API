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

import { TODOS_ROUTE } from 'src/common/constants/routing.constants'
import { IdParamDto } from 'src/common/dto/id-param.dto'
import { TodosService } from './todos.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import type { Todo } from './schemas/todos.schema'

@Controller(TODOS_ROUTE)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async createTodo(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosService.createTodo(createTodoDto)
  }

  @Get()
  async getAllTodos(): Promise<Todo[]> {
    return await this.todosService.getAllTodos()
  }

  @Get(':id')
  async getTodoById(@Param() params: IdParamDto): Promise<Todo> {
    return await this.todosService.getTodoById(params.id)
  }

  @Patch(':id')
  async updateTodo(
    @Param() params: IdParamDto,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.todosService.updateTodo(params.id, updateTodoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTodo(@Param() params: IdParamDto): Promise<void> {
    await this.todosService.deleteTodo(params.id)
  }
}
