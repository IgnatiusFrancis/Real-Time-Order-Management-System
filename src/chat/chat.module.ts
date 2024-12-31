import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/utils';
import { JwtAuthService } from 'src/utils/token.generators';

@Module({
  providers: [ChatService, ChatGateway, PrismaService, JwtAuthService],
  controllers: [ChatController],
})
export class ChatModule {}
