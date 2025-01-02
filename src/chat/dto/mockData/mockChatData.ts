import { Message, User, UserRole } from '@prisma/client';
import { mockUser } from '../../../auth/dto/mockData/mockAuthData';
import { CreateMessageDto } from '../create-message.dto';

export const mockChat: any = {
  id: '8a701d87-409e-4374-a781-9f58957ae86b',
  content: 'Hey, I want to buy laptop',
  createdAt: new Date(),
  senderId: '1c0c9dcd-c1e5-4c5c-abe7-b7218e2e2af7',
  chatRoomId: '42a813e6-af77-4192-bf03-8858a21678d9',
  order: {
    id: 'orderId',
    userId: 'validUserId',
  },
};

export const mockMessage = {
  id: 'messageId',
  chatRoomId: 'chatRoomId',
  senderId: mockUser.id,
  content: 'Test message',
  createdAt: new Date(),
  chatRoom: {
    summary: 'Test summary',
    isClosed: false,
  },
};
export const mockAdminUser: User = {
  ...mockUser,
  role: UserRole.ADMIN,
};

export const mockCreateMessageDto: CreateMessageDto = {
  chatRoomId: 'chatRoomId',
  senderId: mockUser.id,
  content: 'Hello, world!',
};

export const mockChatRoom = {
  id: 'chatRoomId',
  isClosed: false,
  order: {
    id: 'orderId',
    userId: mockUser.id,
  },
};
