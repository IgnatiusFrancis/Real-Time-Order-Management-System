import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Custom software development' })
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      platform: 'web',
      technologies: ['React', 'Node.js'],
    },
  })
  @IsObject()
  specifications: Record<string, any>;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: {
      priority: 'high',
      deadline: '2024-12-31',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
