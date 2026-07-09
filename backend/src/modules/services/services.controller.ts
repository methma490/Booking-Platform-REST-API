import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceEntity } from './service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() service: Partial<ServiceEntity>) {
    return this.servicesService.create(service);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }
}
