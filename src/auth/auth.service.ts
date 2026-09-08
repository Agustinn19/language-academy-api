import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: '7d',
      },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException(
          'Refresh token inválido',
        );
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken =
        await this.jwtService.signAsync(
          newPayload,
          {
            secret: this.configService.getOrThrow<string>(
              'JWT_SECRET',
            ),
            expiresIn: '15m',
          },
        );

      return {
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }
  }
}