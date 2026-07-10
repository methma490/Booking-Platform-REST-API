import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'Methma',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({
    example: 'methma@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Customer phone number',
  })
  @Matches(/^[0-9]{10}$/)
  customerPhone!: string;

  @ApiProperty({
    example: 'uuid-v4',
    description: 'Service ID',
  })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({
    example: '2023-10-10',
    description: 'Booking date',
  })
  @IsDateString()
  bookingDate!: string;

  @ApiProperty({
    example: '14:30',
    description: 'Booking time',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  bookingTime!: string;
  @ApiPropertyOptional({
    example: 'Please arrive early.',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
