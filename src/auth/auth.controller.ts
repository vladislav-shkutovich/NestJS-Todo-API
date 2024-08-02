import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import { Request as ExpressRequest } from 'express'

import { AUTH_ROUTE, LOGIN_ROUTE } from '../common/constants/routing.constants'
import { Public } from '../common/decorators/public.decorator'
import { User } from '../user/schemas/user.schema'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'

// TODO: move it from here and extend ExpressRequest globally
interface AuthenticatedRequest extends ExpressRequest {
  readonly user: User
}

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post(LOGIN_ROUTE)
  async login(@Request() req: AuthenticatedRequest) {
    const accessToken = await this.authService.getAccessToken(req.user)
    return {
      access_token: accessToken,
    }
  }
}
