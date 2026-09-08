import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(
      data.email,
      data.password,
    );
  }

  @Post('refresh')
  refresh(@Body() data: RefreshTokenDto) {
    return this.authService.refresh(
      data.refreshToken,
    );
  }
}