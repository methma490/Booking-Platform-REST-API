import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { seedAdmin } from './admin.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    await seedAdmin(AppDataSource);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeds();
