import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../create-order.dto';
import { mockUser } from '../../../auth/dto/mockData/mockAuthData';

export const mockCreateOrderData: CreateOrderDto = {
  description: 'Custom software development',
  specifications: {
    platform: 'web',
    technologies: ['React', 'Node.js'],
  },
  quantity: 1,
  metadata: {
    priority: 'high',
    deadline: '2024-12-31',
  },
};

export const mockOrder: Order = {
  id: 'ahhsystd-sjjssd-ddk',
  userId: mockUser.id,
  description: 'Test order',
  specifications: '{"size":"L"}',
  quantity: 1,
  metadata: '{"priority":"high"}',
  status: OrderStatus.REVIEW,
  createdAt: new Date(),
  updatedAt: new Date(),
};
