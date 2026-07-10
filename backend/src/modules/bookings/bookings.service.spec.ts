/// <reference types="jest" />

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Booking } from './booking.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { BookingsService } from './bookings.service';
import { ServiceEntity } from '../services/service.entity';

describe('BookingsService', () => {
  let bookingsService: BookingsService;
  let bookingRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let serviceRepository: {
    findOne: jest.Mock;
  };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    bookingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    serviceRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepository,
        },
        {
          provide: getRepositoryToken(ServiceEntity),
          useValue: serviceRepository,
        },
      ],
    }).compile();

    bookingsService = module.get(BookingsService);

    jest.clearAllMocks();
  });

  it('creates a booking for an existing service', async () => {
    const dto = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '1234567890',
      serviceId: 'service-1',
      bookingDate: '2030-01-01',
      bookingTime: '10:00',
      notes: 'Please call on arrival',
    };

    const service = { id: 'service-1' } as ServiceEntity;
    const booking = { id: 1, status: BookingStatus.PENDING } as Booking;

    serviceRepository.findOne.mockResolvedValue(service);
    bookingRepository.findOne.mockResolvedValue(null);
    bookingRepository.create.mockReturnValue(booking);
    bookingRepository.save.mockResolvedValue(booking);

    await expect(bookingsService.create(dto)).resolves.toEqual(booking);
  });

  it('throws when the service does not exist', async () => {
    serviceRepository.findOne.mockResolvedValue(null);

    await expect(
      bookingsService.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'missing-service',
        bookingDate: '2030-01-01',
        bookingTime: '10:00',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when booking date is in the past', async () => {
    serviceRepository.findOne.mockResolvedValue({
      id: 'service-1',
    });

    await expect(
      bookingsService.create({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-1',
        bookingDate: '2000-01-01',
        bookingTime: '10:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when a booking slot is already taken', async () => {
    serviceRepository.findOne.mockResolvedValue({
      id: 'service-1',
    });
    bookingRepository.findOne.mockResolvedValue({ id: 99 });

    await expect(
      bookingsService.create({
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        customerPhone: '1234567890',
        serviceId: 'service-1',
        bookingDate: '2030-01-01',
        bookingTime: '10:00',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns paginated bookings with search and status filters', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[{ id: 1 } as Booking], 1]);

    const result = await bookingsService.findAll(
      2,
      5,
      'john',
      BookingStatus.PENDING,
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      data: [{ id: 1 }],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    });
  });

  it('throws when a cancelled booking is marked completed', async () => {
    bookingRepository.findOne.mockResolvedValue({
      id: 1,
      status: BookingStatus.CANCELLED,
      user: { id: 1 },
      service: { id: 'service-1' },
    });

    await expect(
      bookingsService.updateStatus(1, { status: BookingStatus.COMPLETED }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when cancelling an already cancelled booking', async () => {
    bookingRepository.findOne.mockResolvedValue({
      id: 1,
      status: BookingStatus.CANCELLED,
      user: { id: 1 },
      service: { id: 'service-1' },
    });

    await expect(bookingsService.cancel(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
