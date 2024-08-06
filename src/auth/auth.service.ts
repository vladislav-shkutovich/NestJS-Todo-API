import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ValidationError } from '../common/errors/errors'
import { compare } from '../common/utils/crypto.utils'
import { UserService } from '../user/user.service'
import type { UserWithoutPassword } from '../common/types/user.types'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async getValidatedUser(
    username: string,
    pass: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.userService.findUserByUsername(username)

    const isPasswordMatch = await compare(pass, user.password)

    if (!isPasswordMatch) {
      throw new ValidationError('Wrong password')
    }

    const { password: _password, ...paramsExceptPassword } = user
    return paramsExceptPassword
  }

  async getAccessToken(user: UserWithoutPassword) {
    const payload = { username: user.username, sub: user._id }
    return this.jwtService.sign(payload)
  }
}
