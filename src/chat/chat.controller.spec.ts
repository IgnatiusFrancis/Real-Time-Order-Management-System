import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';
import { mockUser } from '../auth/dto/mockData/mockAuthData';
import { ChatController } from './chat.controller';
import { mockAdminUser, mockChat } from './dto/mockData/mockChatData';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let jwtAuthService: JwtAuthService;
  let prismaService: PrismaService;
  let chatService: ChatService;

  const mockJwtAuthService = {
    generateAuthToken: jest.fn().mockReturnValue('mock-token'),
  };

  const mockChatService = {
    getChatHistory: jest.fn(),
    closeChat: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: JwtAuthService,
          useValue: mockJwtAuthService,
        },
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    prismaService = module.get<PrismaService>(PrismaService);
    chatService = module.get<ChatService>(ChatService);

    jest.clearAllMocks();
  });

  /************************ MOCK  getChatHistory*****************************/
  describe('getChatHistory', () => {
    const chatRoomId = 'hhsystshdn';
    it('should return all chat messages', async () => {
      const expectedResponse = {
        status: true,
        message: 'Chat history fetched successfully',
        data: [mockChat],
      };

      mockChatService.getChatHistory.mockResolvedValue(expectedResponse);

      const result = await controller.getChatHistory(mockUser, chatRoomId);

      expect(result).toEqual(expectedResponse);
      expect(chatService.getChatHistory).toHaveBeenCalledWith(
        mockUser.id,
        chatRoomId,
      );
    });

    it('should handle fetch failure', async () => {
      mockChatService.getChatHistory.mockRejectedValue(
        new HttpException('Fetch failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(
        controller.getChatHistory(mockUser, chatRoomId),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  closeChat *****************************/
  describe('closeChat', () => {
    const chatRoomId = '42a813e6-af77-4192-bf03-8858a21678d9';
    const closeChatDto = { summary: 'Chat ended, thanks' };

    it('should successfully close chat', async () => {
      const expectedResponse = {
        status: true,
        message: 'Chat successfully closed',
        data: {
          id: chatRoomId,
          isClosed: true,
          summary: closeChatDto.summary,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderId: '878ce1ec-5312-4785-bf8a-5266e52192fd',
        },
      };

      mockChatService.closeChat.mockResolvedValue(expectedResponse);

      const result = await controller.closeChat(
        mockAdminUser,
        chatRoomId,
        closeChatDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(chatService.closeChat).toHaveBeenCalledWith(
        mockAdminUser.id,
        chatRoomId,
        closeChatDto,
      );
    });

    it('should handle close chat failure', async () => {
      mockChatService.closeChat.mockRejectedValue(
        new HttpException(
          'Close chat failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(
        controller.closeChat(mockAdminUser, chatRoomId, closeChatDto),
      ).rejects.toThrow(HttpException);
    });
  });
});
