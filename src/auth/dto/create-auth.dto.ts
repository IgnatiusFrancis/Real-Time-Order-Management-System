import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TransformLowerCase } from '../../utils/decorators/transform-toLowerCase.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  @TransformLowerCase()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
