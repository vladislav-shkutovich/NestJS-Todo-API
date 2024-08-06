import { Injectable } from '@nestjs/common'

import { ConflictError } from '../common/errors/errors'
import { hash } from '../common/utils/crypto.utils'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDatabaseService } from './user.database.service'
import type { User } from './schemas/user.schema'

// TODO: return all user data without passwords?

@Injectable()
export class UserService {
  constructor(private readonly userDatabaseService: UserDatabaseService) {}

  async isUserExist(username: string): Promise<boolean> {
    return await this.userDatabaseService.isUserExist(username)
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const isDuplicate = await this.isUserExist(createUserDto.username)

    if (isDuplicate) {
      throw new ConflictError(
        `User with username ${createUserDto.username} already exists`,
      )
    }

    const hashedPassword = await hash(createUserDto.password)

    return await this.userDatabaseService.createUser({
      ...createUserDto,
      password: hashedPassword,
    })
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userDatabaseService.findAllUsers()
  }

  async findUserByUsername(username: string): Promise<User> {
    return await this.userDatabaseService.findUserByUsername(username)
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateParams = { ...updateUserDto }

    if (updateUserDto.password) {
      updateParams.password = await hash(updateUserDto.password)
    }

    return await this.userDatabaseService.updateUser(id, updateParams)
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
