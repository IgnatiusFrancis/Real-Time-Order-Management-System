import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/utils';
import { CloseChatDto } from './dto/close-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async validateAccess(
    userId: string,
    chatRoomId: string,
    role: UserRole,
  ): Promise<void> {
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { order: true },
    });

    if (!chatRoom)
      throw new HttpException('Chat room not found.', HttpStatus.NOT_FOUND);

    if (role === UserRole.USER && chatRoom.order.userId !== userId) {
      throw new HttpException(
        'You do not have access to this chat room.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      const { chatRoomId, senderId, content } = createMessageDto;
      await this.authService.getUserById(senderId);

      const chatRoom = await this.prismaService.chatRoom.findUnique({
        where: { id: chatRoomId },
      });
      if (!chatRoom || chatRoom.isClosed)
        throw new HttpException('Chat room is closed.', HttpStatus.BAD_REQUEST);

      return this.prismaService.message.create({
        data: {
          chatRoomId: chatRoomId,
          senderId: senderId,
          content: content,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating message',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async closeChat(closeChatdto: CloseChatDto) {
    try {
      const { chatRoomId, summary } = closeChatdto;
      const chatRoom = await this.prismaService.chatRoom.findUnique({
        where: { id: chatRoomId },
      });
      if (!chatRoom)
        throw new HttpException('Chat room not found.', HttpStatus.NOT_FOUND);
      if (chatRoom.isClosed)
        throw new HttpException(
          'Chat room is already closed.',
          HttpStatus.BAD_REQUEST,
        );

      const updatedChat = await this.prismaService.chatRoom.update({
        where: { id: chatRoomId },
        data: { isClosed: true, summary },
      });

      await this.prismaService.order.update({
        where: { id: chatRoom.orderId },
        data: { status: OrderStatus.PROCESSING },
      });

      return updatedChat;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while closing chat',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async getChatHistory(userId: string, chatRoomId: string) {
    try {
      const user = await this.authService.getUserById(userId);
      await this.validateAccess(user.id, chatRoomId, user.role);
      return this.prismaService.message.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching chats',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
