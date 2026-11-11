import { Controller, Get } from '@nestjs/common';
import type { AuthSession } from './auth.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@CurrentUser() user: AuthSession['user']) {
    return this.authService.me(user);
  }
}
