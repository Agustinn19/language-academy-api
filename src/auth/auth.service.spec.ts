import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtMock: {
    signAsync: jest.Mock;
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@academy.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    isActive: true,
    hashedRefreshToken: null,
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtMock = {
      signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('fake-secret'),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deberia devolver tokens y datos del usuario con credenciales validas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh');

      const result = await service.login('test@academy.com', 'correct-password');

      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.refreshToken).toBe('fake-jwt-token');
      expect(result.user.email).toBe('test@academy.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('deberia lanzar UnauthorizedException si el email no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('noexiste@academy.com', 'cualquier-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia lanzar UnauthorizedException si la contrasena es incorrecta', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@academy.com', 'password-incorrecta'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});