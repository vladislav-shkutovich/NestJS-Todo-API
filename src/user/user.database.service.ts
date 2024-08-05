import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { ConflictError, NotFoundError } from '../common/errors/errors'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserDatabaseService {
  constructor(@InjectModel(USER_MODEL) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userDuplicate = await this.userModel.findOne({
      username: createUserDto.username,
    })

    // TODO: rework it into Guard usage
    if (userDuplicate) {
      throw new ConflictError(
        `User with username ${createUserDto.username} already exist`,
      )
    }

    const createdUser = await this.userModel.create(createUserDto)

    return createdUser.toObject()
  }

  async findAllUsers(): Promise<User[]> {
    const allUsers = await this.userModel.find()

    return allUsers.map((user) => user.toObject())
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username })

    if (!user) {
      throw new NotFoundError(`User with username ${username} not found`)
    }

    return user.toObject()
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
      },
    )

    if (!updatedUser) {
      throw new NotFoundError(`User with id ${id} not found`)
    }

    return updatedUser.toObject()
  }

  async deleteUser(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id)

    if (!deletedUser) {
      throw new NotFoundError(`User with id ${id} not found`)
    }
  }
}
