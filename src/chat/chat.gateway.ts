import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/utils';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(WsGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('chatRoomId') chatRoomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    await this.chatService.validateAccess(user.id, chatRoomId, user.role);

    client.join(`room-${chatRoomId}`);
    return { message: `Joined room ${chatRoomId}` };
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { chatRoomId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage(data);
    this.server.to(`room-${data.chatRoomId}`).emit('message', message);
    return message;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('closeChat')
  async handleCloseChat(
    @MessageBody() data: { chatRoomId: string; summary: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    if (user.role !== 'ADMIN') throw new Error('Only admins can close chats.');

    const chat = await this.chatService.closeChat({
      chatRoomId: data.chatRoomId,
      summary: data.summary,
    });
    this.server.to(`room-${data.chatRoomId}`).emit('chatClosed', chat);
    return chat;
  }
}
