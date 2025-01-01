import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseChatDto {
  @ApiProperty({
    description: 'Summary provided by the admin when closing the chat',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  summary: string;
}
