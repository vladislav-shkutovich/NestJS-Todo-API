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

import { USERS_ROUTE } from '../common/constants/routing.constants'
import { Public } from '../common/decorators/public.decorator'
import { IdParamDto } from '../common/dto/id-param.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsernameValidationPipe } from './pipes/username-validation.pipe'
import { UserService } from './user.service'
import type { User } from './schemas/user.schema'

@Controller(USERS_ROUTE)
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @UsePipes(UsernameValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto)
  }

  @Get()
  async findAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers()
  }

  @Get(':username')
  async findUserByUsername(@Param() params: any): Promise<User> {
    return await this.userService.findUserByUsername(params.username)
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
