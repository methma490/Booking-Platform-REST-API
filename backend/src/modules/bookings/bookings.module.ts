import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from './booking.entity';
import { ServiceEntity } from '../services/service.entity';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, ServiceEntity])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
