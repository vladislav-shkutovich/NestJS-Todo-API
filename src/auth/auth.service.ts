import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { compare } from 'src/common/utils/crypto.utils'
import { UserService } from 'src/user/user.service'
import type { User } from 'src/user/schemas/user.schema'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findUserByUsername(username)
    if (user && (await compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...paramsExceptPassword } = user
      return paramsExceptPassword
    }
    return null
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
