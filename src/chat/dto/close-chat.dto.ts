import { IsString, IsNotEmpty } from 'class-validator';

export class CloseChatDto {
  @IsString()
  @IsNotEmpty()
  chatRoomId: string;

  @IsString()
  @IsNotEmpty()
  summary: string;
}
