import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/utils';
import { CurrentUser } from 'src/utils/decorators';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':chatRoomId/history')
  async getChatHistory(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
  ) {
    return this.chatService.getChatHistory(user.id, chatRoomId);
  }
}
