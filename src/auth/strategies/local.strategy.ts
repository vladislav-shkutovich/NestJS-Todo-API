import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'
import type { User } from 'src/user/schemas/user.schema'
import { BadRequestError, NotFoundError } from '../../common/errors/errors'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    try {
      return await this.authService.getValidatedUser(username, password)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message)
      }

      if (error instanceof BadRequestError) {
        throw new BadRequestException(error.message)
      }

      throw new UnauthorizedException()
    }
  }
}
