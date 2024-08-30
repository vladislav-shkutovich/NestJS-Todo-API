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
    this.updateUserRecentTodosOnTodoCreate()
    this.updateUserRecentTodosOnTodoUpdate()
    this.updateUserRecentTodosOnTodoDelete()
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
    const user = await this.userDatabaseService.findUserByQuery({ username })

    if (!user) {
      throw new NotFoundError(`User with username ${username} not found`)
    }

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

  async updateUserRecentTodosOnTodoCreate() {
    for await (const createdTodo of this.todosChangeStreamDatabaseService.subscribeOnTodoCreate()) {
      // ? Question: access DB for deprecated user.todos by `getUserById` to update them manually, or access DB for user.todos directly by the `getUserTodos` using query params? In both approaches we access DB, so why not the second one? In both options we access for the same data.

      // Option 1:
      const user = await this.getUserById(createdTodo.userId)

      const recentUserTodos = user.todos.reduce(
        (todos, todo) => {
          if (todos.length < USER_RECENT_TODOS_COUNT) {
            todos.push(todo)
          }
          return todos
        },
        [createdTodo],
      )

      await this.userDatabaseService.updateUser(createdTodo.userId, {
        todos: recentUserTodos,
      })

      // Option 2:
      /*
      const userId = recentTodo.userId.toString()

      const recentUserTodos = await this.getUserTodos(userId, {
        sort: { updatedAt: -1 },
        limit: USER_RECENT_TODOS_COUNT,
      })
  
      return await this.userDatabaseService.updateUser(userId, {
        todos: recentUserTodos,
      })
      */
    }
  }

  async updateUserRecentTodosOnTodoUpdate() {
    for await (const updatedTodo of this.todosChangeStreamDatabaseService.subscribeOnTodoUpdate()) {
      const user = await this.getUserById(updatedTodo.userId)

      const recentUserTodos = user.todos.reduce(
        (todos, todo) => {
          if (
            todos.length < USER_RECENT_TODOS_COUNT &&
            !todo._id.equals(updatedTodo._id)
          ) {
            todos.push(todo)
          }
          return todos
        },
        [updatedTodo],
      )

      await this.userDatabaseService.updateUser(updatedTodo.userId, {
        todos: recentUserTodos,
      })
    }
  }

  async updateUserRecentTodosOnTodoDelete() {
    for await (const deletedTodoId of this.todosChangeStreamDatabaseService.subscribeOnTodoDelete()) {
      const user = await this.userDatabaseService.findUserByQuery({
        'todos._id': deletedTodoId,
      })

      if (user) {
        const userId = user._id.toString()

        // TODO: - Rework sorting for todos by user (related to many places where it used);
        const recentUserTodos = await this.getUserTodos(userId, {
          sort: { updatedAt: -1 },
          limit: USER_RECENT_TODOS_COUNT,
        })

        await this.userDatabaseService.updateUser(userId, {
          todos: recentUserTodos,
        })
      }
    }
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userDatabaseService.deleteUser(id)
  }
}
