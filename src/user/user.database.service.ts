import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { NotFoundError } from '../common/errors/errors'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserDatabaseService {
  constructor(@InjectModel(USER_MODEL) private userModel: Model<User>) {}

  async isUserExistByUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne(
      { username },
      { _id: -1, username: 1 },
    )
    return !!user
  }

  async isUserExistById(id: string): Promise<boolean> {
    const userById = await this.userModel.findById(id, { _id: 1 })
    return !!userById
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.userModel.create(createUserDto)

    return createdUser.toObject()
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await this.userModel.find()

    return allUsers.map((user) => user.toObject())
  }

  async getUserById(id: string): Promise<User> {
    const userById = await this.userModel.findById(id)

    if (!userById) {
      throw new NotFoundError(`User with id ${id} not found`)
    }

    return userById.toObject()
  }

  async findUserByQuery(query: Record<string, any>): Promise<User | null> {
    const user = await this.userModel.findOne(query)

    if (!user) {
      return null
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
