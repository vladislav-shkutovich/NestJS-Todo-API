import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { ValidationError, NotFoundError } from '../../common/errors/errors'
import { AuthService } from '../auth.service'
import type { User } from '../../user/schemas/user.schema'

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

      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message)
      }

      throw new InternalServerErrorException(error.message)
    }
  }
}
