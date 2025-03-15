import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtAuthService } from '../utils/token.generators';
import { Socket, Server } from 'socket.io';
import { UserRole } from '@prisma/client';
import { WsGuard } from '../utils/guards/ws.guard';
import {
  CustomWsException,
  WsStatus,
} from '../utils/filters/custom-ws.exception';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtAuthService: JwtAuthService;

  // Define proper types for mocks
  type MockServer = Partial<Server> & {
    to: jest.Mock;
    emit: jest.Mock;
  };

  type MockSocket = Partial<Socket> & {
    id: string;
    handshake: {
      headers: {
        authorization: string;
      };
    };
    join: jest.Mock;
    emit: jest.Mock;
    disconnect: jest.Mock;
  };

  const mockServer: MockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockSocket = {
    id: 'test-socket-id',
    handshake: {
      headers: {
        authorization: 'Bearer valid-token',
      },
    },
    join: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  const mockChatService = {
    getAllChatRoomIds: jest.fn(),
    getUserChatRoomIds: jest.fn(),
    createMessage: jest.fn(),
  };

  const mockJwtAuthService = {
    decodeAuthToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: JwtAuthService,
          useValue: mockJwtAuthService,
        },
      ],
    })
      .overrideGuard(WsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);

    // Set up the mock server with proper typing
    gateway.server = mockServer as unknown as Server;

    // Important: Set up the socketMap with our test socket
    gateway['socketMap'] = new Map([
      ['test-sender', { socketId: 'test-socket-id', role: 'user' }],
    ]);

    jest.clearAllMocks();
  });

  /************************ MOCK  handleConnection*****************************/
  describe('handleConnection', () => {
    const mockUserId = 'test-user-id';
    const mockUserRole = UserRole.USER;
    const mockChatRooms = ['room1', 'room2'];

    beforeEach(() => {
      mockJwtAuthService.decodeAuthToken.mockReturnValue({
        id: mockUserId,
        role: mockUserRole,
      });
      mockChatService.getUserChatRoomIds.mockResolvedValue(mockChatRooms);
      mockChatService.getAllChatRoomIds.mockResolvedValue(mockChatRooms);
    });

    it('should handle user connection successfully', async () => {
      await gateway.handleConnection(
        mockSocket as unknown as Socket<DefaultEventsMap>,
      );

      expect(mockJwtAuthService.decodeAuthToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(mockSocket.join).toHaveBeenCalledTimes(mockChatRooms.length);
      mockChatRooms.forEach((room) => {
        expect(mockSocket.join).toHaveBeenCalledWith(`room-${room}`);
      });
    });

    it('should handle admin connection and join all chat rooms', async () => {
      mockJwtAuthService.decodeAuthToken.mockReturnValue({
        id: mockUserId,
        role: UserRole.ADMIN,
      });

      await gateway.handleConnection(
        mockSocket as unknown as Socket<DefaultEventsMap>,
      );

      expect(mockChatService.getAllChatRoomIds).toHaveBeenCalled();
      expect(mockSocket.join).toHaveBeenCalledTimes(mockChatRooms.length);
    });

    it('should throw error when authorization header is missing', async () => {
      const socketWithoutAuth = {
        ...mockSocket,
        handshake: { headers: {} },
      };

      await expect(
        gateway.handleConnection(
          socketWithoutAuth as unknown as Socket<DefaultEventsMap>,
        ),
      ).rejects.toThrow(CustomWsException);
      expect(socketWithoutAuth.disconnect).toHaveBeenCalled();
    });
  });

  /************************ MOCK  handleSendMessage*****************************/
  describe('handleSendMessage', () => {
    interface MessageData {
      chatRoomId: string;
      content: string;
    }

    const mockMessageData: MessageData = {
      chatRoomId: 'test-room',
      // senderId: 'test-sender',
      content: 'Hello, World!',
    };

    const mockCreatedMessage = {
      id: 'message-id',
      ...mockMessageData,
      senderId: 'test-socket-id',
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockChatService.createMessage.mockResolvedValue(mockCreatedMessage);
    });

    it('should handle sending message successfully', async () => {
      const result = await gateway.handleSendMessage(
        mockMessageData,
        mockSocket as unknown as Socket<DefaultEventsMap>,
      );

      expect(chatService.createMessage).toHaveBeenCalledWith({
        ...mockMessageData,
        senderId: 'test-sender',
      });
      expect(mockServer.to).toHaveBeenCalledWith(
        `room-${mockMessageData.chatRoomId}`,
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'message',
        mockCreatedMessage,
      );
      expect(result).toEqual(mockCreatedMessage);
    });

    it('should throw error when message data is invalid', async () => {
      const invalidData: MessageData = {
        chatRoomId: '',
        // senderId: '',
        content: '',
      };

      await expect(
        gateway.handleSendMessage(
          invalidData,
          mockSocket as unknown as Socket<DefaultEventsMap>,
        ),
      ).rejects.toThrow(CustomWsException);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          status: WsStatus.BAD_REQUEST,
        }),
      );
    });

    it('should handle service errors', async () => {
      mockChatService.createMessage.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        gateway.handleSendMessage(
          mockMessageData,
          mockSocket as unknown as Socket<DefaultEventsMap>,
        ),
      ).rejects.toThrow();

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          status: WsStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    });
  });

  /************************ MOCK  handleDisconnect*****************************/
  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      const userId = 'test-user-id';
      (gateway as any).socketMap.set(userId, { socketId: mockSocket.id });

      gateway.handleDisconnect(
        mockSocket as unknown as Socket<DefaultEventsMap>,
      );

      expect((gateway as any).socketMap.has(userId)).toBeFalsy();
    });
  });
});
