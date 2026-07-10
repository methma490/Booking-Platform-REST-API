import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: 1,
    description: 'User unique identifier',
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Column()
  fullName!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address (unique)',
  })
  @Column({
    unique: true,
  })
  email!: string;

  @ApiProperty({
    example: 'hashedPassword',
    description: 'User hashed password (not returned in responses)',
    required: false,
  })
  @Column({
    select: false,
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'User refresh token (not returned in responses)',
  })
  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  refreshToken?: string | null;

  @ApiProperty({
    example: Role.CUSTOMER,
    enum: Role,
    description: 'User role',
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role!: Role;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User creation timestamp',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
