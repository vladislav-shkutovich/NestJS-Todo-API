import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'

import { AUTH_ROUTE, LOGIN_ROUTE } from '../common/constants/routing.constants'
import { Public } from '../common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post(LOGIN_ROUTE)
  async login(@Request() req: ExpressRequest) {
    const accessToken = await this.authService.getAccessToken(req.user)
    return {
      access_token: accessToken,
    }
  }
}
