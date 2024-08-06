import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { throwMissingEnvVar } from '../../common/utils/env.utils'
import type { User } from '../../user/schemas/user.schema'

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

  async validate({ sub, username }): Promise<Omit<User, 'password'>> {
    return { _id: sub, username: username }
  }
}
