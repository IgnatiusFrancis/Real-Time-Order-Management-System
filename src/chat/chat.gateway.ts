import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/utils';
import { JwtAuthService } from 'src/utils/token.generators';
import { UserRole } from '@prisma/client';

@WebSocketGateway({ cors: true, namespace: '/api/v1/chat' })
// @WebSocketGateway({
//   transports: ['websocket'],
//   namespace: '/api/v1/notifications',
//   cors: {
//     origin: process.env.CORS_ORIGINS?.split(',') || '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,PATCH',
//     allowedHeaders: 'Content-Type,Authorization',
//     credentials: true,
//   },
// })
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  private socketMap = new Map<string, { socketId: string }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  @UseGuards(WsGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const authorizationHeader: string =
        client.handshake.headers.authorization;
      const token = authorizationHeader.split(' ')[1];

      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }

      const payload: any = this.jwtAuthService.decodeAuthToken(token);
      const userId: string = payload.id;
      const userRole: string = payload.role;

      this.logger.verbose(
        `Client connected: ${client.id}, User ID: ${userId}, Role: ${userRole}`,
      );

      // Map the user ID to the socket ID
      this.socketMap.set(userId, { socketId: client.id });

      // Fetch user-specific chat rooms
      let chatRooms: string[] = [];

      if (userRole === UserRole.ADMIN) {
        // Admins have access to all chat rooms
        const allRooms = await this.chatService.getAllChatRoomIds();
        chatRooms = allRooms.map((room) => `room-${room}`);
      } else {
        // Regular users have access only to their associated chat rooms
        const userRooms = await this.chatService.getUserChatRoomIds(userId);
        chatRooms = userRooms.map((room) => `room-${room}`);
      }

      // Add the user to their respective chat rooms
      chatRooms.forEach((room) => client.join(room));
      this.logger.debug(
        `User ID ${userId} joined rooms: ${chatRooms.join(', ')}`,
      );

      // Fetch chat histories
      // const chats = await this.chatService.getChatHistory(userId, );

      // Emit fetched messages to the client
      // this.server.to(client.id).emit('chats', chats);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect(true);
      throw error;
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.warn(`Client disconnected: ${client.id}`);

    const userId = Array.from(this.socketMap.entries()).find(
      ([_, value]) => value.socketId === client.id,
    )?.[0];

    if (userId !== undefined) {
      this.socketMap.delete(userId);
    }
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { chatRoomId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.warn(
      `Creating chat by ${data.senderId}: ${JSON.stringify(data)}`,
    );
    const message = await this.chatService.createMessage(data);
    this.server.to(`room-${data.chatRoomId}`).emit('message', message);

    this.logger.log(`message broadcast to room: room-${data.chatRoomId}`);
  }
}
