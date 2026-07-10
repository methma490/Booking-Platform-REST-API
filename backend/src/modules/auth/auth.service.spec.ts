/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { Role } from '../../common/enums/role.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
    findByIdWithSensitiveFields: jest.Mock;
    updateRefreshToken: jest.Mock;
    clearRefreshToken: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { get: jest.Mock };
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithSensitiveFields: jest.fn(),
      updateRefreshToken: jest.fn(),
      clearRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configService = {
      get: jest
        .fn()
        .mockImplementation((_key: string, fallback: string) => fallback),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('registers a new customer and hides sensitive fields', async () => {
    const dto: RegisterDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
    };

    const createdUser = {
      id: 1,
      name: dto.name,
      email: dto.email,
      password: 'hashed-password',
      refreshToken: 'hashed-refresh-token',
      role: Role.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    usersService.findByEmail.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValueOnce('hashed-password' as never);
    usersService.create.mockResolvedValue(createdUser);

    const result = await authService.register(dto);

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        email: dto.email,
        password: 'hashed-password',
        role: Role.CUSTOMER,
      }),
    );
    expect(result.message).toBe('User registered successfully');
    expect(result.user).toMatchObject({
      id: 1,
      name: dto.name,
      email: dto.email,
      role: Role.CUSTOMER,
    });
    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('refreshToken');
  });

  it('rejects registration when the email already exists', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in and stores a hashed refresh token', async () => {
    const dto: LoginDto = {
      email: 'jane@example.com',
      password: 'Password123!',
    };

    const user = {
      id: 1,
      email: dto.email,
      password: 'hashed-password',
      role: Role.CUSTOMER,
    } as User;

    usersService.findByEmail.mockResolvedValue(user);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValueOnce('hashed-refresh-token' as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await authService.login(dto);

    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
      1,
      'hashed-refresh-token',
    );
  });

  it('refreshes tokens when the refresh token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'jane@example.com',
      role: Role.CUSTOMER,
    });

    usersService.findByIdWithSensitiveFields.mockResolvedValue({
      id: 1,
      email: 'jane@example.com',
      password: 'hashed-password',
      refreshToken: 'stored-refresh-token',
      role: Role.CUSTOMER,
    });

    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValueOnce(
      'hashed-new-refresh-token' as never,
    );
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await authService.refreshTokens('stored-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
      1,
      'hashed-new-refresh-token',
    );
  });

  it('logs out by clearing the stored refresh token', async () => {
    await expect(authService.logout(1)).resolves.toEqual({
      message: 'Logged out successfully',
    });

    expect(usersService.clearRefreshToken).toHaveBeenCalledWith(1);
  });
});
