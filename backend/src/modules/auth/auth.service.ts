import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Role } from '../../common/enums/role.enum';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);

    if (exists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: Role.CUSTOMER,
    });

    return {
      message: 'User registered successfully',
      user: this.toPublicUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matched = await bcrypt.compare(dto.password, user.password);

    if (!matched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);

    await this.setCurrentRefreshToken(user.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: Role;
      }>(refreshToken, {
        secret: this.configService.get<string>(
          'jwt.refreshSecret',
          'superRefreshSecretKey',
        ),
      });

      const user = await this.usersService.findByIdWithSensitiveFields(
        payload.sub,
      );

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);

      await this.setCurrentRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);

    return {
      message: 'Logged out successfully',
    };
  }

  private toPublicUser(user: User) {
    const publicUser: Partial<User> = { ...user };
    delete publicUser.password;
    delete publicUser.refreshToken;

    return publicUser;
  }

  private async getTokens(userId: number, email: string, role: Role) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret', 'superSecretKey'),
        expiresIn: this.configService.get<StringValue>('jwt.expiresIn', '1d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(
          'jwt.refreshSecret',
          'superRefreshSecretKey',
        ),
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiresIn',
          '7d',
        ) as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async setCurrentRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }
}
