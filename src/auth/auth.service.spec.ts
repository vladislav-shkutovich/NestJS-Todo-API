import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { jest } from '@jest/globals'

import { AuthService } from './auth.service'
import { compare } from 'src/common/utils/crypto.utils'
import { type User, UserService } from 'src/user/user.service'

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

  describe('validateUser()', () => {
    it('should return the user data without password if validation is successful', async () => {
      const mockUser: User = {
        userId: 1,
        username: 'test',
        password: 'hashed',
      }

      userService.findUserByUsername.mockResolvedValue(mockUser)
      ;(compare as jest.Mock).mockImplementation(() => true)

      const result = await authService.validateUser(mockUser.username, 'test')
      expect(result).toEqual({ userId: 1, username: 'test' })
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(compare).toHaveBeenCalledWith('test', mockUser.password)
    })

    it('should return null if validation is not successful', async () => {
      const mockUser: User = {
        userId: 1,
        username: 'test',
        password: 'hashed',
      }

      userService.findUserByUsername.mockResolvedValue(mockUser)
      ;(compare as jest.Mock).mockImplementation(() => false)

      const result = await authService.validateUser(
        mockUser.username,
        'wrongpassword',
      )
      expect(result).toBeNull()
      expect(userService.findUserByUsername).toHaveBeenCalledWith(
        mockUser.username,
      )
      expect(compare).toHaveBeenCalledWith('wrongpassword', mockUser.password)
    })
  })

  describe('login()', () => {
    it('should return an access token', async () => {
      const mockUser: User = {
        userId: 1,
        username: 'test',
        password: 'hashed',
      }
      const mockToken = 'mockToken'

      jwtService.sign.mockReturnValue(mockToken)

      const result = await authService.login(mockUser)
      expect(result).toEqual({ access_token: mockToken })
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'test', sub: 1 })
    })
  })
})
