import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from './service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  create(service: Partial<ServiceEntity>) {
    return this.serviceRepository.save(service);
  }

  findAll() {
    return this.serviceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findById(id: string) {
    return this.serviceRepository.findOne({
      where: { id },
    });
  }
}
