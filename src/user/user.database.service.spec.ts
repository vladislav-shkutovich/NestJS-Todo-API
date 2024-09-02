import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { USER_MODEL } from '../common/constants/database.constants'
import { NotFoundError } from '../common/errors/errors'
import { UserDatabaseService } from './user.database.service'
import type { UpdateUserDto } from './dto/update-user.dto'

describe('UserDatabaseService', () => {
  let userDatabaseService: UserDatabaseService
  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDatabaseService,
        {
          provide: getModelToken(USER_MODEL),
          useValue: mockUserModel,
        },
      ],
    }).compile()

    userDatabaseService = module.get<UserDatabaseService>(UserDatabaseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('updateUser()', () => {
    const id = new Types.ObjectId()
    const updateParams: UpdateUserDto = {
      username: 'username',
      password: 'password',
    }
    const updatedUser = {
      _id: id,
      username: updateParams.username,
      password: updateParams.password,
      toObject: jest.fn(),
    }

    it('should call method with correct arguments', async () => {
      mockUserModel.findByIdAndUpdate.mockImplementation(() => updatedUser)
      await userDatabaseService.updateUser(id, updateParams)

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateParams,
        { new: true },
      )
    })

    it('should return correct value', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue(updatedUser)

      await expect(
        userDatabaseService.updateUser(id, updateParams),
      ).resolves.toEqual(updatedUser.toObject())
    })

    it('should throw NotFoundError if todo not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue(null)

      await expect(
        userDatabaseService.updateUser(new Types.ObjectId(), updateParams),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
