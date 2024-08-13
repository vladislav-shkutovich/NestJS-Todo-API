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

import { TODOS_ROUTE, USERS_ROUTE } from '../common/constants/routing.constants'
import { Public } from '../common/decorators/public.decorator'
import { IdParamDto } from '../common/dto/id-param.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'
import type { Todo } from '../todos/schemas/todos.schema'
import type { User } from './schemas/user.schema'

@Controller(USERS_ROUTE)
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto)
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers()
  }

  @Get(':id')
  async getUserById(@Param() params: IdParamDto): Promise<User> {
    return await this.userService.getUserById(params.id)
  }

  @Get(`:id/${TODOS_ROUTE}`)
  async getUserTodos(@Param() params: IdParamDto): Promise<Todo[]> {
    return await this.userService.getUserTodos(params.id)
  }

  // ! TODO: - Allow to update only accepted user fileds (prevent updating user `todos` and `_id` for this case);
  // The same for updateTodos and globally for other possible update endpoints
  // ? Question: How I can do it without manual checking and filtering of the updating fields in UserService?
  @Patch(':id')
  async updateUser(
    @Param() params: IdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(params.id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param() params: IdParamDto): Promise<void> {
    return await this.userService.deleteUser(params.id)
  }
}
