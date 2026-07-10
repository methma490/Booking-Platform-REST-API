import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('services')
export class ServiceEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Service unique identifier (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'Haircut',
    description: 'Service title',
  })
  @Column({
    length: 150,
  })
  title!: string;

  @ApiProperty({
    example: 'Professional haircut service',
    description: 'Service description',
  })
  @Column('text')
  description!: string;

  @ApiProperty({
    example: 30,
    description: 'Service duration in minutes',
  })
  @Column()
  duration!: number;

  @ApiProperty({
    example: 25.00,
    description: 'Service price',
  })
  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price!: number;

  @ApiProperty({
    example: true,
    description: 'Whether the service is active',
  })
  @Column({
    default: true,
  })
  isActive!: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Service creation timestamp',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Service last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiPropertyOptional({
    type: () => [Booking],
    description: 'Bookings associated with this service',
  })
  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];
}
