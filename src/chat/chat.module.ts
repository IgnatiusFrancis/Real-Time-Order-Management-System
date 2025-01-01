import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../utils/prisma';
import { JwtAuthService } from '../utils/token.generators';

@Module({
  providers: [ChatService, ChatGateway, PrismaService, JwtAuthService],
  controllers: [ChatController],
})
export class ChatModule {}
