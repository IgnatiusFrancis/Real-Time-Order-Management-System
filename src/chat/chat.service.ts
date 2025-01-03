import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  ChatRoom,
  Message,
  OrderStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../utils/prisma';
import { CloseChatDto } from './dto/close-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetResponse } from '../utils/interface/response.interface';
import {
  CustomWsException,
  WsStatus,
} from '../utils/filters/custom-ws.exception';

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

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const { chatRoomId, senderId, content } = createMessageDto;

      const sender = await this.authService.getUserById(senderId);

      if (!sender) {
        throw new CustomWsException('Sender not found.', WsStatus.NOT_FOUND);
      }

      // Fetch the chat room along with its associated order and user
      const chatRoom = await this.prismaService.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: { order: { select: { userId: true } } },
      });

      if (!chatRoom) {
        throw new CustomWsException(
          'Chat room does not exist.',
          WsStatus.NOT_FOUND,
        );
      }

      if (chatRoom.isClosed) {
        throw new CustomWsException('Chat room is closed.', WsStatus.FORBIDDEN);
      }

      // Allow admins to send messages to any chat room
      if (sender.role !== UserRole.ADMIN) {
        // Check if the sender is the owner of the order associated with the chat room

        if (chatRoom.order.userId !== senderId) {
          throw new CustomWsException(
            'You are not authorized to send messages in this room.',
            WsStatus.FORBIDDEN,
          );
        }
      }

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
          'An error occurred while creating the message.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async closeChat(
    userId: string,
    chatRoomId: string,
    closeChatdto: CloseChatDto,
  ): Promise<GetResponse<ChatRoom>> {
    try {
      await this.authService.getUserById(userId);
      const { summary } = closeChatdto;
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

      return {
        status: true,
        message: 'Chat successfully closed',
        data: updatedChat,
      };
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

  async getChatHistory(
    userId: string,
    chatRoomId: string,
  ): Promise<GetResponse<Message[]>> {
    try {
      const user = await this.authService.getUserById(userId);
      await this.validateAccess(user.id, chatRoomId, user.role);
      const messages = await this.prismaService.message.findMany({
        where: { chatRoomId },
        include: { chatRoom: { select: { summary: true, isClosed: true } } },
        orderBy: { createdAt: 'asc' },
      });

      return {
        status: true,
        message: 'Chat history fetched successfully',
        data: messages,
      };
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

  async getUserChatRoomIds(userId: string): Promise<string[]> {
    try {
      const orders = await this.prismaService.order.findMany({
        where: { userId },
        select: { chatRoom: { select: { id: true } } },
      });

      // Extract chat room IDs
      return orders
        .filter((order) => order.chatRoom !== null)
        .map((order) => order.chatRoom!.id);
    } catch (error) {
      throw error;
    }
  }

  // Get all chat rooms (admin use case)
  async getAllChatRoomIds(): Promise<string[]> {
    try {
      const chatRooms = await this.prismaService.chatRoom.findMany({
        select: { id: true },
      });

      return chatRooms.map((chatRoom) => chatRoom.id);
    } catch (error) {
      throw error;
    }
  }
}
