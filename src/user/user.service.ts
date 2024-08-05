import { Injectable } from '@nestjs/common'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDatabaseService } from './user.database.service'
import type { User } from './schemas/user.schema'

// TODO: return all user data without passwords?

@Injectable()
export class UserService {
  constructor(private readonly userDatabaseService: UserDatabaseService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.userDatabaseService.createUser(createUserDto)
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userDatabaseService.findAllUsers()
  }

  async findUserByUsername(username: string): Promise<User> {
    return await this.userDatabaseService.findUserByUsername(username)
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userDatabaseService.updateUser(id, updateUserDto)
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
