import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Haircut',
    description: 'Service title',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Professional haircut service',
    description: 'Service description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 30,
    description: 'Service duration in minutes',
  })
  @IsNumber()
  @Min(1)
  duration!: number;

  @ApiProperty({
    example: 25.00,
    description: 'Service price',
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: true,
    description: 'Whether the service is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
