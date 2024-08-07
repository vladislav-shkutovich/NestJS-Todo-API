import { Injectable } from '@nestjs/common'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import { ConflictError, ValidationError } from '../common/errors/errors'
import { UserWithoutPassword } from '../common/types/user.types'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDatabaseService } from './user.database.service'
import type { User } from './schemas/user.schema'

const scryptAsync = promisify(scrypt)

@Injectable()
export class UserService {
  constructor(private readonly userDatabaseService: UserDatabaseService) {}
  private readonly keyLength = 64

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = await scryptAsync(password, salt, this.keyLength)
    return `${salt}.${(derivedKey as Buffer).toString('hex')}`
  }

  private async comparePasswords(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    const [salt, hashKey] = hashPassword.split('.')
    const hashKeyBuff = Buffer.from(hashKey, 'hex')
    const derivedKey = await scryptAsync(password, salt, this.keyLength)
    return timingSafeEqual(hashKeyBuff, derivedKey as Buffer)
  }

  async getUserByCredentials(
    username: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.findUserByUsername(username)

    const isPasswordMatch = await this.comparePasswords(password, user.password)

    if (!isPasswordMatch) {
      throw new ValidationError('Wrong password')
    }

    const { password: _password, ...paramsExceptPassword } = user
    return paramsExceptPassword
  }

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

    const hashedPassword = await this.hashPassword(createUserDto.password)

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
      updateParams.password = await this.hashPassword(updateUserDto.password)
    }

    return await this.userDatabaseService.updateUser(id, updateParams)
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
