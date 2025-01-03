import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from '../utils/guards/ws.guard';
import { JwtAuthService } from '../utils/token.generators';
import { UserRole } from '@prisma/client';
import {
  CustomWsException,
  WsStatus,
} from '../utils/filters/custom-ws.exception';

@WebSocketGateway({ cors: true, namespace: '/api/v1/chat' })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  private socketMap = new Map<string, { socketId: string }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const authorizationHeader: string =
        client.handshake.headers.authorization;

      if (!authorizationHeader) {
        throw new CustomWsException(
          'Authorization header not provided',
          WsStatus.NOT_FOUND,
        );
      }

      const token = authorizationHeader.split(' ')[1];
      if (!token) {
        throw new CustomWsException('Token not provided', WsStatus.NOT_FOUND);
      }

      const payload: any = this.jwtAuthService.decodeAuthToken(token);
      const userId: string = payload.id;
      const userRole: string = payload.role;

      this.logger.verbose(
        `Client connected: ${client.id}, User ID: ${userId}, Role: ${userRole}`,
      );

      // Map the user ID to the socket ID.
      this.socketMap.set(userId, { socketId: client.id });

      // Fetch user-specific chat rooms
      let chatRooms: string[] = [];

      if (userRole === UserRole.ADMIN) {
        chatRooms = (await this.chatService.getAllChatRoomIds()).map(
          (room) => `room-${room}`,
        );
      } else {
        chatRooms = (await this.chatService.getUserChatRoomIds(userId)).map(
          (room) => `room-${room}`,
        );
      }

      chatRooms.forEach((room) => client.join(room));
      this.logger.debug(
        `User ID ${userId} joined rooms: ${chatRooms.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
      );
      client.emit('error', {
        message: error.message,
        status:
          error instanceof CustomWsException
            ? error.status
            : WsStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
      client.disconnect(true);
      throw error;
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      this.logger.warn(`Client disconnected: ${client.id}`);

      const userId = Array.from(this.socketMap.entries()).find(
        ([_, value]) => value.socketId === client.id,
      )?.[0];

      if (userId !== undefined) {
        this.socketMap.delete(userId);
        this.logger.debug(`Removed socket mapping for user: ${userId}`);
      }
    } catch (error) {
      this.logger.error('Disconnect error:', {
        error: error.message,
        stack: error.stack,
        clientId: client.id,
      });
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { chatRoomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data.chatRoomId || !data.content) {
        throw new CustomWsException(
          'Invalid message data',
          WsStatus.BAD_REQUEST,
          data,
        );
      }

      const userId = Array.from(this.socketMap.entries()).find(
        ([_, value]) => value.socketId === client.id,
      )?.[0];

      this.logger.debug(
        `Creating chat message for user ${userId} in room: room-${data.chatRoomId}`,
      );

      const message = await this.chatService.createMessage({
        ...data,
        senderId: userId,
      });

      const roomId = `room-${data.chatRoomId}`;
      this.server.to(roomId).emit('message', message);

      this.logger.debug(`Message broadcasted to room: ${roomId}`);
      return message;
    } catch (error) {
      this.logger.error('Error handling sendMessage:', {
        error: error.message,
        data,
        clientId: client.id,
      });
      client.emit('error', {
        message:
          error instanceof CustomWsException
            ? error.message
            : 'Internal server error',
        status:
          error instanceof CustomWsException
            ? error.status
            : WsStatus.INTERNAL_SERVER_ERROR,
        data: error instanceof CustomWsException ? error.data : null,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}
