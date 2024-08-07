import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import type { UserWithoutPassword } from '../common/types/user.types'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getAccessToken(user: UserWithoutPassword) {
    const payload = { username: user.username, sub: user._id }
    return this.jwtService.sign(payload)
  }
}
