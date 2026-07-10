import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Booking Platform REST API',
      version: '1.0.0',
      status: 'Running',
      documentation: '/api',
      timestamp: new Date().toISOString(),
    };
  }
}
