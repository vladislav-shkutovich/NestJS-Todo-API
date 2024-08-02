import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { BadRequestError, NotFoundError } from '../common/errors/errors'
import { compare } from '../common/utils/crypto.utils'
import { UserService } from '../user/user.service'
import type { User } from '../user/schemas/user.schema'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async getValidatedUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    // TODO: add `username` and `pass` fields validation using class-validator

    const user = await this.userService.findUserByUsername(username)

    // TODO: discuss if errors throwing should be duplicated here (the same handled in `findUserByUsername`)
    if (!user) {
      throw new NotFoundError(`User with username ${username} not found`)
    }

    const isPasswordMatch = await compare(pass, user.password)

    if (!isPasswordMatch) {
      throw new BadRequestError('Wrong password')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...paramsExceptPassword } = user
    return paramsExceptPassword
  }

  async getAccessToken(user: User) {
    const payload = { username: user.username, sub: user._id }
    return this.jwtService.sign(payload)
  }
}
