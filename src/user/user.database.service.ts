import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { hash } from 'src/common/utils/crypto.utils'
import { USER_MODEL } from 'src/common/constants/database.constants'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import type { User } from './schemas/user.schema'

@Injectable()
export class UserDatabaseService {
  constructor(@InjectModel(USER_MODEL) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await hash(createUserDto.password)
    const createdUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return createdUser.toObject()
  }

  async findAllUsers(): Promise<User[]> {
    const allUsers = await this.userModel.find()
    return allUsers.map((user) => user.toObject())
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username })

    if (!user) {
      // TODO: this method used in validate fn at Guards level, which invoked before any interceptors
      // TODO: discuss if it acceptable to use only exception filters instead of custom errors
      // TODO: here and in all other places (by NotFoundException search)
      throw new NotFoundException(`User with username ${username} not found`)
    }

    return user.toObject()
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateParams = { ...updateUserDto }

    if (updateUserDto.password) {
      updateParams.password = await hash(updateUserDto.password)
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateParams,
      {
        new: true,
      },
    )

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return updatedUser.toObject()
  }

  async deleteUser(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id)

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
  }
}
