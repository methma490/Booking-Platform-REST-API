import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Booking } from './booking.entity';
import { ServiceEntity } from '../services/service.entity';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

import { BookingStatus } from './enums/booking-status.enum';

export interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    const service = await this.findServiceOrFail(dto.serviceId);

    this.validateBookingDate(dto.bookingDate);
    await this.ensureTimeSlotIsAvailable(dto);

    const booking = this.bookingRepository.create({
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      bookingDate: dto.bookingDate,
      bookingTime: dto.bookingTime,
      notes: dto.notes,
      status: BookingStatus.PENDING,
      service,
    });

    try {
      return await this.bookingRepository.save(booking);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { driverError?: { code?: string } }).driverError?.code ===
          '23505'
      ) {
        throw new ConflictException(
          'This service is already booked for the selected date and time',
        );
      }

      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
  ): Promise<PaginatedBookings> {
    const bookingStatus = this.parseBookingStatus(status);
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service');

    if (search) {
      query.andWhere(
        `(booking.customerName ILIKE :search
        OR booking.customerEmail ILIKE :search
        OR booking.customerPhone ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (bookingStatus) {
      query.andWhere('booking.status = :status', {
        status: bookingStatus,
      });
    }

    query
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(
    id: number,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findById(id);

    if (
      booking.status === BookingStatus.CANCELLED &&
      dto.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cancelled booking cannot be marked as completed',
      );
    }

    booking.status = dto.status;

    return this.bookingRepository.save(booking);
  }

  async cancel(id: number): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;

    return this.bookingRepository.save(booking);
  }

  private async findServiceOrFail(serviceId: string): Promise<ServiceEntity> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  private validateBookingDate(date: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(date);

    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }
  }

  private async ensureTimeSlotIsAvailable(
    dto: CreateBookingDto,
  ): Promise<void> {
    const duplicate = await this.bookingRepository.findOne({
      where: {
        bookingDate: dto.bookingDate,
        bookingTime: dto.bookingTime,
        service: {
          id: dto.serviceId,
        },
      },
      relations: {
        service: true,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'This service is already booked for the selected date and time',
      );
    }
  }

  private parseBookingStatus(status?: string): BookingStatus | undefined {
    if (!status) {
      return undefined;
    }

    const bookingStatuses = Object.values(BookingStatus);

    if (!bookingStatuses.includes(status as BookingStatus)) {
      throw new BadRequestException('Invalid booking status');
    }

    return status as BookingStatus;
  }
}
