import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../utils/prisma';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import {
  mockAdminUser,
  mockChat,
  mockChatRoom,
  mockCreateMessageDto,
  mockMessage,
} from './dto/mockData/mockChatData';
import { mockUser } from '../auth/dto/mockData/mockAuthData';
import { CloseChatDto } from './dto/close-chat.dto';
import { UserRole } from '@prisma/client';
import {
  CustomWsException,
  WsStatus,
} from '../utils/filters/custom-ws.exception';

describe('ChatService', () => {
  let chatService: ChatService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    chatRoom: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuthService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  /************************ MOCK  getChatHistory *****************************/
  describe('getChatHistory', () => {
    it('should return chat history for a valid user and chat room', async () => {
      // Mocking methods
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue(mockChatRoom);
      mockPrismaService.message.findMany.mockResolvedValue([mockMessage]);

      const result = await chatService.getChatHistory(
        mockUser.id,
        'chatRoomId',
      );

      expect(result).toEqual({
        status: true,
        message: 'Chat history fetched successfully',
        data: [mockMessage],
      });
      expect(authService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(prismaService.chatRoom.findUnique).toHaveBeenCalledWith({
        where: { id: 'chatRoomId' },
        include: { order: true },
      });
      expect(prismaService.message.findMany).toHaveBeenCalledWith({
        where: { chatRoomId: 'chatRoomId' },
        include: { chatRoom: { select: { summary: true, isClosed: true } } },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should throw an error if chat room access is denied', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      jest
        .spyOn(chatService, 'validateAccess')
        .mockRejectedValue(
          new HttpException('Access denied', HttpStatus.FORBIDDEN),
        );

      await expect(
        chatService.getChatHistory(mockUser.id, 'invalidChatRoomId'),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  createMessage *****************************/
  describe('createMessage', () => {
    it('should create a new message', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue(mockChatRoom);
      mockPrismaService.message.create.mockResolvedValue(mockMessage);

      const result = await chatService.createMessage(mockCreateMessageDto);

      expect(result).toEqual(mockMessage);
      expect(authService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(prismaService.chatRoom.findUnique).toHaveBeenCalled();
      expect(prismaService.message.create).toHaveBeenCalled();
    });

    it('should throw an error if the sender is unauthorized', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue(mockChatRoom);

      await expect(
        chatService.createMessage({
          ...mockCreateMessageDto,
          senderId: 'unauthorizedId',
        }),
      ).rejects.toThrow(CustomWsException);

      // asserting the error message and status
      try {
        await chatService.createMessage({
          ...mockCreateMessageDto,
          senderId: 'unauthorizedId',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(CustomWsException);
        expect(error.message).toBe(
          'You are not authorized to send messages in this room.',
        );
        expect(error.status).toBe(WsStatus.FORBIDDEN);
      }
    });
  });

  /************************ MOCK  closeChat *****************************/
  describe('closeChat', () => {
    const closeChatDto: CloseChatDto = { summary: 'Chat closed successfully' };

    it('should close an active chat room', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockAdminUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatRoom.update.mockResolvedValue({
        ...mockChat,
        isClosed: true,
      });

      const result = await chatService.closeChat(
        mockAdminUser.id,
        'chatRoomId',
        closeChatDto,
      );

      expect(result).toEqual({
        status: true,
        message: 'Chat successfully closed',
        data: { ...mockChat, isClosed: true },
      });
      expect(authService.getUserById).toHaveBeenCalledWith(mockAdminUser.id);
      expect(prismaService.chatRoom.update).toHaveBeenCalled();
    });

    it('should throw an error if the chat room is already closed', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockAdminUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue({
        ...mockChat,
        isClosed: true,
      });

      await expect(
        chatService.closeChat(mockAdminUser.id, 'chatRoomId', closeChatDto),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  validateAccess *****************************/
  describe('validateAccess', () => {
    it('should throw an error if the user does not have access', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.chatRoom.findUnique.mockResolvedValue(mockChat);

      await expect(
        chatService.validateAccess(
          mockUser.id,
          mockChat.chatRoomId,
          UserRole.USER,
        ),
      ).rejects.toThrow(HttpException);
    });
  });
});
