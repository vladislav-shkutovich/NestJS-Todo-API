import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { ConflictError, NotFoundError } from '../common/errors/errors'
import { hash } from '../common/utils/crypto.utils'
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

    const hashedPassword = await hash(createUserDto.password)
    const createdUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    })

    // TODO: return createdUser without password?
    return createdUser.toObject()
  }

  async findAllUsers(): Promise<User[]> {
    const allUsers = await this.userModel.find()

    // TODO: return allUsers without passwords?
    return allUsers.map((user) => user.toObject())
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username })

    if (!user) {
      throw new NotFoundError(`User with username ${username} not found`)
    }

    // TODO: return user without password?
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
      throw new NotFoundError(`User with id ${id} not found`)
    }

    // TODO: return updatedUser without password?
    return updatedUser.toObject()
  }

  async deleteUser(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id)

    if (!deletedUser) {
      throw new NotFoundError(`User with id ${id} not found`)
    }
  }
}
