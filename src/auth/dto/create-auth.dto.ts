import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TransformLowerCase } from '../../utils/decorators/transform-toLowerCase.decorator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @TransformLowerCase()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
