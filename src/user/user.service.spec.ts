import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { ConflictError, ValidationError } from '../common/errors/errors'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './schemas/user.schema'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'
import type { UpdateUserDto } from './dto/update-user.dto'

describe('UserService', () => {
  let userService: UserService
  let userDatabaseService: DeepMocked<UserDatabaseService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserDatabaseService,
          useValue: createMock<UserDatabaseService>(),
        },
      ],
    }).compile()

    userService = module.get<UserService>(UserService)
    userDatabaseService =
      module.get<DeepMocked<UserDatabaseService>>(UserDatabaseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getUserByCredentials', () => {
    const mockUser: User = {
      _id: new Types.ObjectId(),
      username: 'username',
      password: 'hashed_password',
    }

    it('should throw ValidationError if wrong password provided', async () => {
      const enteredPassword = 'wrongpassword'

      userService.findUserByUsername = jest.fn().mockResolvedValue(mockUser)
      userService['comparePasswords'] = jest.fn().mockResolvedValue(false)

      await expect(
        userService.getUserByCredentials(mockUser.username, enteredPassword),
      ).rejects.toThrow(ValidationError)
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(userService['comparePasswords']).toHaveBeenCalledWith(
        enteredPassword,
        mockUser.password,
      )
    })

    it('should return user without password if validation is successful', async () => {
      const enteredPassword = 'password'

      userService.findUserByUsername = jest.fn().mockResolvedValue(mockUser)
      userService['comparePasswords'] = jest.fn().mockResolvedValue(true)
      await userService.getUserByCredentials(mockUser.username, enteredPassword)

      await expect(
        userService.getUserByCredentials(mockUser.username, enteredPassword),
      ).resolves.toEqual({ _id: mockUser._id, username: mockUser.username })
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(userService['comparePasswords']).toHaveBeenCalledWith(
        enteredPassword,
        mockUser.password,
      )
    })
  })

  describe('isUserExist()', () => {
    const username = 'username'

    it('should call method with correct arguments', async () => {
      await userService.isUserExist(username)
      expect(userDatabaseService.isUserExist).toHaveBeenCalledWith(username)
    })

    it('should return correct value', async () => {
      userDatabaseService.isUserExist.mockResolvedValue(false)
      await expect(userService.isUserExist(username)).resolves.toEqual(false)
    })
  })

  describe('createUser()', () => {
    const enteredUser: CreateUserDto = {
      username: 'username',
      password: 'password',
    }
    const hashedPassword = 'hashed_password'

    it('should throw ConflictError if user already exists', async () => {
      userService.isUserExist = jest.fn().mockResolvedValue(true)
      userService['hashPassword'] = jest.fn()

      await expect(userService.createUser(enteredUser)).rejects.toThrow(
        ConflictError,
      )
      expect(userService.isUserExist).toHaveBeenCalledWith(enteredUser.username)
      expect(userDatabaseService.createUser).not.toHaveBeenCalled()
      expect(userService['hashPassword']).not.toHaveBeenCalled()
    })

    it('should call method with correct arguments if user does not exist', async () => {
      userService.isUserExist = jest.fn().mockResolvedValue(false)
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)
      await userService.createUser(enteredUser)

      expect(userService.isUserExist).toHaveBeenCalledWith(enteredUser.username)
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
      }

      userService.isUserExist = jest.fn().mockResolvedValue(false)
      userService['hashPassword'] = jest.fn().mockResolvedValue(hashedPassword)
      userDatabaseService.createUser.mockResolvedValue(createdUser)

      await expect(userService.createUser(enteredUser)).resolves.toEqual(
        createdUser,
      )
    })
  })

  describe('findAllUsers()', () => {
    it('should call method with correct arguments', async () => {
      await userService.findAllUsers()

      expect(userDatabaseService.findAllUsers).toHaveBeenCalled()
    })

    it('should return correct value', async () => {
      const userList: User[] = [
        {
          _id: new Types.ObjectId(),
          username: 'username',
          password: 'password',
        },
      ]

      userDatabaseService.findAllUsers.mockResolvedValue(userList)

      await expect(userService.findAllUsers()).resolves.toEqual(userList)
    })
  })

  describe('findUserByUsername()', () => {
    const id = new Types.ObjectId().toString()

    it('should call method with correct arguments', async () => {
      await userService.findUserByUsername(id)

      expect(userDatabaseService.findUserByUsername).toHaveBeenCalledWith(id)
    })

    it('should return correct value', async () => {
      const mockUser: User = {
        _id: new Types.ObjectId(id),
        username: 'username',
        password: 'password',
      }

      userDatabaseService.findUserByUsername.mockResolvedValue(mockUser)

      await expect(userService.findUserByUsername(id)).resolves.toEqual(
        mockUser,
      )
    })
  })

  describe('update()', () => {
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
