import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { compare } from 'src/common/utils/crypto.utils'
import { UserService } from 'src/user/user.service'
import { BadRequestError, NotFoundError } from '../common/errors/errors'
import type { User } from 'src/user/schemas/user.schema'

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
    const user = await this.userService.findUserByUsername(username)

    // TODO: discuss if I should duplicate errors throwing here (the same handled in findUserByUsername)
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
