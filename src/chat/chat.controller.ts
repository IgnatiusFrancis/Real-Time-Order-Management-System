import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../utils/guards';
import { CurrentUser } from '../utils/decorators';
import { User, UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CloseChatDto } from './dto/close-chat.dto';
import { Role } from '../utils/decorators/role.decorator';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /************************ getChatHistory *****************************/
  @Get(':chatRoomId/history')
  @ApiOperation({ summary: 'Get chat history for a specific room' })
  @ApiResponse({
    status: 200,
    description: 'Chat history fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat room not found',
  })
  async getChatHistory(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
  ) {
    return this.chatService.getChatHistory(user.id, chatRoomId);
  }

  /************************ closeChat *****************************/
  @ApiBearerAuth()
  @Patch(':chatRoomId/close')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Close a chat room' })
  @ApiResponse({
    status: 200,
    description: 'Chat room closed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only admins can close chat rooms',
  })
  async closeChat(
    @CurrentUser() user: User,
    @Param('chatRoomId') chatRoomId: string,
    @Body() closeChatDto: CloseChatDto,
  ) {
    return this.chatService.closeChat(user.id, chatRoomId, closeChatDto);
  }
}
