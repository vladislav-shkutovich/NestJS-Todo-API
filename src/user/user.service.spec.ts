import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { ConflictError, ValidationError } from '../common/errors/errors'
import { TodosChangeStreamDatabaseService } from '../todos/todos.change-stream.database.service'
import { TodosService } from '../todos/todos.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './schemas/user.schema'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'
import type { Todo } from '../todos/schemas/todos.schema'
import type { UpdateUserDto } from './dto/update-user.dto'

describe('UserService', () => {
  let userService: UserService
  let userDatabaseService: DeepMocked<UserDatabaseService>
  let todosService: DeepMocked<TodosService>
  let _todosChangeStreamDatabaseService: DeepMocked<TodosChangeStreamDatabaseService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserDatabaseService,
          useValue: createMock<UserDatabaseService>(),
        },
        {
          provide: TodosService,
          useValue: createMock<TodosService>(),
        },
        {
          provide: TodosChangeStreamDatabaseService,
          useValue: createMock<TodosChangeStreamDatabaseService>(),
        },
      ],
    }).compile()

    userService = module.get<UserService>(UserService)
    userDatabaseService =
      module.get<DeepMocked<UserDatabaseService>>(UserDatabaseService)
    todosService = module.get<DeepMocked<TodosService>>(TodosService)
    _todosChangeStreamDatabaseService = module.get<
      DeepMocked<TodosChangeStreamDatabaseService>
    >(TodosChangeStreamDatabaseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getUserByCredentials', () => {
    const mockUser: User = {
      _id: new Types.ObjectId(),
      username: 'username',
      password: 'hashed_password',
      todos: [],
    }

    it('should throw ValidationError if wrong password provided', async () => {
      const enteredPassword = 'wrongpassword'

      userDatabaseService.findUserByQuery = jest
        .fn()
        .mockResolvedValue(mockUser)
      userService['comparePasswords'] = jest.fn().mockResolvedValue(false)

      await expect(
        userService.getUserByCredentials(mockUser.username, enteredPassword),
      ).rejects.toThrow(ValidationError)
      expect(userDatabaseService.findUserByQuery).toHaveBeenCalledWith({
        username: mockUser.username,
      })
      expect(userService['comparePasswords']).toHaveBeenCalledWith(
        enteredPassword,
        mockUser.password,
      )
    })

    it('should return user if validation is successful', async () => {
      const enteredPassword = 'password'

      userDatabaseService.findUserByQuery = jest
        .fn()
        .mockResolvedValue(mockUser)
      userService['comparePasswords'] = jest.fn().mockResolvedValue(true)
      await userService.getUserByCredentials(mockUser.username, enteredPassword)

      await expect(
        userService.getUserByCredentials(mockUser.username, enteredPassword),
      ).resolves.toEqual(mockUser)
      expect(userDatabaseService.findUserByQuery).toHaveBeenCalledWith({
        username: mockUser.username,
      })
      expect(userService['comparePasswords']).toHaveBeenCalledWith(
        enteredPassword,
        mockUser.password,
      )
    })
  })

  describe('isUserExistByUsername()', () => {
    const username = 'username'

    it('should call method with correct arguments', async () => {
      await userService.isUserExistByUsername(username)
      expect(userDatabaseService.isUserExistByUsername).toHaveBeenCalledWith(
        username,
      )
    })

    it('should return correct value', async () => {
      userDatabaseService.isUserExistByUsername.mockResolvedValue(false)
      await expect(
        userService.isUserExistByUsername(username),
      ).resolves.toEqual(false)
    })
  })

  describe('createUser()', () => {
    const enteredUser: CreateUserDto = {
      username: 'username',
      password: 'password',
    }
    const hashedPassword = 'hashed_password'

    it('should throw ConflictError if user already exists', async () => {
      userService.isUserExistByUsername = jest.fn().mockResolvedValue(true)
      userService['hashPassword'] = jest.fn()

      await expect(userService.createUser(enteredUser)).rejects.toThrow(
        ConflictError,
      )
      expect(userService.isUserExistByUsername).toHaveBeenCalledWith(
        enteredUser.username,
      )
      expect(userDatabaseService.createUser).not.toHaveBeenCalled()
      expect(userService['hashPassword']).not.toHaveBeenCalled()
    })

    it('should call method with correct arguments if user does not exist', async () => {
      userService.isUserExistByUsername = jest.fn().mockResolvedValue(false)
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)
      await userService.createUser(enteredUser)

      expect(userService.isUserExistByUsername).toHaveBeenCalledWith(
        enteredUser.username,
      )
      expect(userService['hashPassword']).toHaveBeenCalledWith(
        enteredUser.password,
      )
      expect(userDatabaseService.createUser).toHaveBeenCalledWith({
        ...enteredUser,
        password: hashedPassword,
      })
    })

    it('should return correct value', async () => {
      const createdUser: User = {
        _id: new Types.ObjectId(),
        ...enteredUser,
        password: hashedPassword,
        todos: [],
      }

      userService.isUserExistByUsername = jest.fn().mockResolvedValue(false)
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)
      userDatabaseService.createUser.mockResolvedValue(createdUser)

      await expect(userService.createUser(enteredUser)).resolves.toEqual(
        createdUser,
      )
    })
  })

  describe('getAllUsers()', () => {
    it('should call method with correct arguments', async () => {
      await userService.getAllUsers()

      expect(userDatabaseService.getAllUsers).toHaveBeenCalled()
    })

    it('should return correct value', async () => {
      const userList: User[] = [
        {
          _id: new Types.ObjectId(),
          username: 'username',
          password: 'password',
          todos: [],
        },
      ]

      userDatabaseService.getAllUsers.mockResolvedValue(userList)

      await expect(userService.getAllUsers()).resolves.toEqual(userList)
    })
  })

  describe('getUserTodos()', () => {
    const userId = new Types.ObjectId().toString()
    it('should call method with correct arguments', async () => {
      const queryOptions = {}
      await userService.getUserTodos(userId, queryOptions)

      expect(todosService.getAllTodosByUserId).toHaveBeenCalledWith(
        userId,
        queryOptions,
      )
    })

    it('should return correct value', async () => {
      const todoList: Todo[] = [
        {
          _id: new Types.ObjectId(),
          title: 'Test title',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: new Types.ObjectId(),
        },
      ]

      todosService.getAllTodosByUserId.mockResolvedValue(todoList)

      await expect(userService.getUserTodos(userId)).resolves.toEqual(todoList)
    })
  })

  describe('updateUser()', () => {
    const id = new Types.ObjectId().toString()
    const updateParams: UpdateUserDto = {
      password: 'updatedpassword',
    }
    const hashedPassword = 'hashed_password'

    it('should call method with correct arguments', async () => {
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)
      await userService.updateUser(id, updateParams)

      expect(userService['hashPassword']).toHaveBeenCalledWith(
        updateParams.password,
      )
      expect(userDatabaseService.updateUser).toHaveBeenCalledWith(id, {
        ...updateParams,
        password: hashedPassword,
      })
    })

    it('should return correct value', async () => {
      const updatedUser: User = {
        _id: new Types.ObjectId(id),
        username: 'Test title',
        password: hashedPassword,
        todos: [],
      }

      userDatabaseService.updateUser.mockResolvedValue(updatedUser)
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)

      await expect(userService.updateUser(id, updateParams)).resolves.toEqual(
        updatedUser,
      )
    })
  })

  describe('deleteUser()', () => {
    it('should call method with correct argument', async () => {
      const id = new Types.ObjectId().toString()

      await userService.deleteUser(id)

      expect(userDatabaseService.deleteUser).toHaveBeenCalledWith(id)
    })
  })
})
