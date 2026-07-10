import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',

  host: configService.get<string>('database.host', 'localhost'),
  port: configService.get<number>('database.port', 5432),

  username: configService.get<string>('database.username', 'postgres'),
  password: configService.get<string>('database.password', ''),

  database: configService.get<string>('database.database', 'booking_platform'),

  autoLoadEntities: true,

  synchronize: configService.get<boolean>('database.synchronize', true),

  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: configService.get<boolean>('database.migrationsRun', false),
});
