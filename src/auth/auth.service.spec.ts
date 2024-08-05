import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { jest } from '@jest/globals'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { compare } from 'src/common/utils/crypto.utils'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import type { User } from 'src/user/schemas/user.schema'

jest.mock('src/common/utils/crypto.utils', () => ({
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let authService: AuthService
  let userService: DeepMocked<UserService>
  let jwtService: DeepMocked<JwtService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userService = module.get<DeepMocked<UserService>>(UserService)
    jwtService = module.get<DeepMocked<JwtService>>(JwtService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getValidatedUser()', () => {
    it('should return the user data without password if validation is successful', async () => {
      const mockCompare = compare as jest.Mock
      const mockUser: User = {
        _id: new Types.ObjectId(),
        username: 'test',
        password: 'hashed',
      }
      const enteredPassword = 'test'

      userService.findUserByUsername.mockResolvedValue(mockUser)
      mockCompare.mockImplementation(() => true)

      await expect(
        authService.getValidatedUser(mockUser.username, enteredPassword),
      ).resolves.toEqual({ _id: mockUser._id, username: mockUser.username })
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(compare).toHaveBeenCalledWith(enteredPassword, mockUser.password)
    })

    it('should return null if validation is not successful', async () => {
      const mockCompare = compare as jest.Mock
      const mockUser: User = {
        _id: new Types.ObjectId(),
        username: 'test',
        password: 'hashed',
      }
      const enteredPassword = 'wrongpassword'

      userService.findUserByUsername.mockResolvedValue(mockUser)
      mockCompare.mockImplementation(() => false)

      await expect(
        authService.getValidatedUser(mockUser.username, enteredPassword),
      ).rejects.toThrow()
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(compare).toHaveBeenCalledWith(enteredPassword, mockUser.password)
    })
  })

  describe('login()', () => {
    it('should return an access token', async () => {
      const mockUser: User = {
        _id: new Types.ObjectId(),
        username: 'test',
        password: 'hashed',
      }
      const mockToken = 'mockToken'

      jwtService.sign.mockReturnValue(mockToken)

      await expect(authService.getAccessToken(mockUser)).resolves.toEqual(
        mockToken,
      )
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser._id,
      })
    })
  })
})
