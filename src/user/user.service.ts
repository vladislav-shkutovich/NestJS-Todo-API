import { Injectable, OnModuleInit } from '@nestjs/common'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import { USER_RECENT_TODOS_COUNT } from '../common/constants/user.constants'
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
import type { QueryOptions } from '../common/types/common.types'
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
    this.todosChangeStreamDatabaseService.subscribeOnTodoCreate(
      this.updateUserRecentTodos.bind(this),
    )

    this.todosChangeStreamDatabaseService.subscribeOnTodoUpdate(
      this.updateUserRecentTodos.bind(this),
    )

    this.todosChangeStreamDatabaseService.subscribeOnTodoDelete(
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

  // TODO: - Return reduce into updateUserRecentTodos for create and update methods (to prevent redundant access to the DB);
  async updateUserRecentTodos(todo: Todo) {
    const userId = todo.userId.toString()

    const recentUserTodos = await this.getUserTodos(userId, {
      sort: { updatedAt: -1 },
      limit: USER_RECENT_TODOS_COUNT,
    })

    return await this.userDatabaseService.updateUser(userId, {
      todos: recentUserTodos,
    })
  }

  // TODO: - Add new UserService method for delete subscription;
  /*
  // todo -> todoId
  async updateUserRecentTodos(todo: Todo) {
    const userId = todo.userId.toString()

    const recentUserTodos = await this.getUserTodos(userId, {
      sort: { updatedAt: -1 },
      limit: USER_RECENT_TODOS_COUNT,
    })

    return await this.userDatabaseService.updateUser(userId, {
      todos: recentUserTodos,
    })
  }
  */

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
