import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information', () => {
      const result = appController.getRoot();

      expect(result).toEqual(
        expect.objectContaining({
          name: 'Booking Platform REST API',
          version: '1.0.0',
          status: 'Running',
          documentation: '/api',
        }),
      );
    });
  });
});
