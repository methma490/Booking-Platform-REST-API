/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ServiceEntity } from './service.entity';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let servicesService: ServicesService;
  let serviceRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    serviceRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(ServiceEntity),
          useValue: serviceRepository,
        },
      ],
    }).compile();

    servicesService = module.get(ServicesService);
  });

  it('creates a service', async () => {
    const dto = {
      title: 'Haircut',
      description: 'Basic haircut',
      duration: 30,
      price: 25,
      isActive: true,
    } as ServiceEntity;

    serviceRepository.save.mockResolvedValue(dto);

    await expect(servicesService.create(dto)).resolves.toEqual(dto);
  });

  it('updates an existing service', async () => {
    const service = {
      id: 'service-1',
      title: 'Haircut',
      description: 'Basic haircut',
      duration: 30,
      price: 25,
      isActive: true,
    } as ServiceEntity;

    serviceRepository.findOne.mockResolvedValue(service);
    serviceRepository.save.mockResolvedValue({
      ...service,
      title: 'Premium Cut',
    });

    await expect(
      servicesService.update('service-1', { title: 'Premium Cut' }),
    ).resolves.toMatchObject({ title: 'Premium Cut' });
  });

  it('throws when updating a missing service', async () => {
    serviceRepository.findOne.mockResolvedValue(null);

    await expect(
      servicesService.update('missing', { title: 'New Title' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns services ordered by newest first', async () => {
    serviceRepository.find.mockResolvedValue([{ id: 'service-1' }]);

    await expect(servicesService.findAll()).resolves.toEqual([
      { id: 'service-1' },
    ]);

    expect(serviceRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
  });

  it('removes an existing service', async () => {
    const service = { id: 'service-1' } as ServiceEntity;

    serviceRepository.findOne.mockResolvedValue(service);
    serviceRepository.remove.mockResolvedValue(service);

    await expect(servicesService.remove('service-1')).resolves.toEqual(service);
  });

  it('throws when removing a missing service', async () => {
    serviceRepository.findOne.mockResolvedValue(null);

    await expect(servicesService.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
