import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { jest } from '@jest/globals'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'

import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import type { User } from 'src/user/schemas/user.schema'

describe('AuthService', () => {
  let authService: AuthService
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
    jwtService = module.get<DeepMocked<JwtService>>(JwtService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getAccessToken()', () => {
    it('should return an access token', async () => {
      const mockUser: User = {
        _id: new Types.ObjectId(),
        username: 'test',
        password: 'hashed',
        todos: [],
      }
      const mockJwtPayload = { ...mockUser, sub: mockUser._id }
      const mockToken = 'mockToken'

      jwtService.sign.mockReturnValue(mockToken)

      await expect(authService.getAccessToken(mockUser)).resolves.toEqual(
        mockToken,
      )
      expect(jwtService.sign).toHaveBeenCalledWith(mockJwtPayload)
    })
  })
})
