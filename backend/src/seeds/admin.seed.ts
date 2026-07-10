import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@bookingplatform.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = userRepository.create({
    fullName: 'System Administrator',
    email: 'admin@bookingplatform.com',
    password: hashedPassword,
    role: Role.ADMIN,
  });

  await userRepository.save(admin);

  console.log('Admin user created successfully');
  console.log('Email: admin@bookingplatform.com');
  console.log('Password: Admin@123');
}
