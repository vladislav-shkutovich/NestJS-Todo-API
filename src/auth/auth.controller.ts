import { Controller, Request, Post, UseGuards } from '@nestjs/common'

import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { AUTH_ROUTE, LOGIN_ROUTE } from 'src/common/constants/routing.constants'
import { Public } from 'src/common/decorators/public.decorator'

@Controller(AUTH_ROUTE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post(LOGIN_ROUTE)
  async login(@Request() req) {
    return this.authService.login(req.user)
  }
}
