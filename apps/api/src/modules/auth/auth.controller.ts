import { Controller, Get } from '@nestjs/common';
import type { AuthSession } from './auth.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller()
export class AuthController {
  @Get('me')
  me(@CurrentUser() user: AuthSession['user']) {
    return user;
  }
}
