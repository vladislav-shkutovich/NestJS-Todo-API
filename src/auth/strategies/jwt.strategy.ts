import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { throwMissingEnvVar } from '../../common/utils/env.utils'
import type {
  UserJwtPayload,
  UserWithoutPassword,
} from '../../common/types/user.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        throwMissingEnvVar('JWT_SECRET'),
    })
  }

  validate(payload: UserJwtPayload): UserWithoutPassword {
    delete payload.sub
    return payload
  }
}
