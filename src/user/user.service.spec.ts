import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { hash } from '../common/utils/crypto.utils'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './schemas/user.schema'
import { UserDatabaseService } from './user.database.service'
import { UserService } from './user.service'
import type { UpdateUserDto } from './dto/update-user.dto'
import { ConflictError } from '../common/errors/errors'

jest.mock('src/common/utils/crypto.utils', () => ({
  hash: jest.fn(),
}))

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
    const mockHash = hash as jest.Mock
    const enteredUser: CreateUserDto = {
      username: 'username',
      password: 'password',
    }
    const hashedPassword = 'hashed_password'

    it('should throw ConflictError if user already exists', async () => {
      userService.isUserExist = jest.fn().mockResolvedValue(true)

      await expect(userService.createUser(enteredUser)).rejects.toThrow(
        ConflictError,
      )
      expect(userService.isUserExist).toHaveBeenCalledWith(enteredUser.username)
      expect(userDatabaseService.createUser).not.toHaveBeenCalled()
      expect(mockHash).not.toHaveBeenCalled()
    })

    it('should call method with correct arguments if user does not exist', async () => {
      userService.isUserExist = jest.fn().mockResolvedValue(false)
      mockHash.mockResolvedValue(hashedPassword)
      await userService.createUser(enteredUser)

      expect(userService.isUserExist).toHaveBeenCalledWith(enteredUser.username)
      expect(mockHash).toHaveBeenCalledWith(enteredUser.password)
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
      mockHash.mockResolvedValue(hashedPassword)
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
      const user: User = {
        _id: new Types.ObjectId(id),
        username: 'username',
        password: 'password',
      }

      userDatabaseService.findUserByUsername.mockResolvedValue(user)

      await expect(userService.findUserByUsername(id)).resolves.toEqual(user)
    })
  })

  describe('update()', () => {
    const mockHash = hash as jest.Mock
    const id = new Types.ObjectId().toString()
    const updateParams: UpdateUserDto = {
      password: 'updatedpassword',
    }
    const hashedPassword = 'hashed_password'

    it('should call method with correct arguments', async () => {
      mockHash.mockResolvedValue(hashedPassword)
      await userService.updateUser(id, updateParams)

      expect(mockHash).toHaveBeenCalledWith(updateParams.password)
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
      mockHash.mockResolvedValue(hashedPassword)

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
