import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { ServiceEntity } from '../services/service.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('bookings')
@Unique('UQ_booking_service_date_time', [
  'serviceId',
  'bookingDate',
  'bookingTime',
])
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @Column()
  customerName!: string;

  @ApiProperty()
  @Column()
  customerEmail!: string;

  @ApiProperty()
  @Column()
  customerPhone!: string;

  @ApiProperty()
  @Column({
    type: 'date',
  })
  bookingDate!: string;

  @ApiProperty()
  @Column()
  bookingTime!: string;

  @ApiPropertyOptional()
  @Column({
    nullable: true,
  })
  notes?: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Column({ nullable: true })
  serviceId!: string;

  @ManyToOne(() => ServiceEntity, (service) => service.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service!: ServiceEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
