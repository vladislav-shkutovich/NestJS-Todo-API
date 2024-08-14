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

import { USERS_ROUTE } from '../common/constants/routing.constants'
import { Public } from '../common/decorators/public.decorator'
import { IdParamDto } from '../common/dto/id-param.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'
import type { Todo } from '../todos/schemas/todos.schema'
import type { User } from './schemas/user.schema'

@Controller(USERS_ROUTE)
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

  // ? To be discussed later how to handle this logic in multiple roles in the most convenient way
  @Get(':id/todos')
  async getUserTodos(@Param() params: IdParamDto): Promise<Todo[]> {
    return await this.userService.getUserTodos(params.id)
  }

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
