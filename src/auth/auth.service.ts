import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import type {
  UserJwtPayload,
  UserWithoutPassword,
} from '../common/types/user.types'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getAccessToken(user: UserWithoutPassword): Promise<string> {
    const payload: UserJwtPayload = { ...user, sub: user._id }
    return this.jwtService.sign(payload)
  }
}
