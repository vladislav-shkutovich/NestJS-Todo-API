import { Injectable, OnModuleInit } from '@nestjs/common'
import { QueryOptions } from 'mongoose'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../common/errors/errors'
import { TodosChangeStreamDatabaseService } from '../todos/todos.change-stream.database.service'
import { TodosService } from '../todos/todos.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDatabaseService } from './user.database.service'
import type { Todo } from '../todos/schemas/todos.schema'
import type { User } from './schemas/user.schema'

const scryptAsync = promisify(scrypt)

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly userDatabaseService: UserDatabaseService,
    private readonly todosService: TodosService,
    private readonly todosChangeStreamDatabaseService: TodosChangeStreamDatabaseService,
  ) {}
  private readonly keyLength = 64

  onModuleInit() {
    this.todosChangeStreamDatabaseService.addEventListener(
      'create',
      this.updateUserRecentTodos.bind(this),
    )

    this.todosChangeStreamDatabaseService.addEventListener(
      'update',
      this.updateUserRecentTodos.bind(this),
    )
  }

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
  ): Promise<User> {
    const user = await this.userDatabaseService.getUserByQuery({ username })

    const isPasswordMatch = await this.comparePasswords(password, user.password)

    if (!isPasswordMatch) {
      throw new ValidationError('Wrong password')
    }

    return user
  }

  async isUserExistByUsername(username: string): Promise<boolean> {
    return await this.userDatabaseService.isUserExistByUsername(username)
  }

  async isUserExistById(id: string): Promise<boolean> {
    return await this.userDatabaseService.isUserExistById(id)
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const isDuplicate = await this.isUserExistByUsername(createUserDto.username)

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

  async getAllUsers(): Promise<User[]> {
    return await this.userDatabaseService.getAllUsers()
  }

  async getUserById(id: string): Promise<User> {
    return await this.userDatabaseService.getUserById(id)
  }

  async getUserTodos(userId: string, options?: QueryOptions): Promise<Todo[]> {
    const isUserExist = await this.isUserExistById(userId)

    if (!isUserExist) {
      throw new NotFoundError(`User with id ${userId} not found`)
    }

    return await this.todosService.getAllTodosByUserId(userId, options)
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateParams = { ...updateUserDto }

    if (updateUserDto.password) {
      updateParams.password = await this.hashPassword(updateUserDto.password)
    }

    return await this.userDatabaseService.updateUser(id, updateParams)
  }

  async updateUserRecentTodos(userId: string, latestTodo: Todo) {
    const user = await this.getUserById(userId)

    const updatedTodos = user.todos.reduce(
      (todos, todo) => {
        if (todos.length < 5 && !todo._id.equals(latestTodo._id)) {
          todos.push(todo)
        }
        return todos
      },
      [latestTodo],
    )

    return await this.userDatabaseService.updateUser(userId, {
      todos: updatedTodos,
    })
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
