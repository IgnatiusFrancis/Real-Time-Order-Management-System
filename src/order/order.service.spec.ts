import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../utils/prisma';
import { AuthService } from '../auth/auth.service';
import { OrderStatus } from '@prisma/client';
import { mockUser } from '../auth/dto/mockData/mockAuthData';
import { mockCreateOrderData, mockOrder } from './dto/mockData/mockOrderData';

describe('OrderService', () => {
  let orderService: OrderService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    chatRoom: {
      create: jest.fn(),
    },
  };

  const mockAuthService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
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

    orderService = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  /************************ MOCK  createOrder*****************************/
  describe('createOrder', () => {
    it('should successfully create an order with chat room', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.chatRoom.create.mockResolvedValue({
        id: 'ywuwnsuss-sksdi',
        orderId: mockOrder.id,
      });

      const result = await orderService.createOrder(
        mockUser.id,
        mockCreateOrderData,
      );

      expect(result.status).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(result.data.order).toBeDefined();
      expect(result.data.chatRoom).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      mockAuthService.getUserById.mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      await expect(
        orderService.createOrder(mockUser.id, mockCreateOrderData),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  markOrderAsCompleted*****************************/
  describe('markOrderAsCompleted', () => {
    it('should successfully mark order as completed', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PROCESSING,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });

      const result = await orderService.markOrderAsCompleted(
        mockUser.id,
        mockOrder.id,
      );

      expect(result.status).toBe(true);
      expect(result.message).toBe('Order successfully completed.');
      expect(result.data.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw error if order not in PROCESSING state', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        orderService.markOrderAsCompleted(mockUser.id, mockOrder.id),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  getOrders*****************************/
  describe('getOrders', () => {
    it('should return all orders with chat rooms', async () => {
      const mockOrders = [mockOrder];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrders();

      expect(result.status).toBe(true);
      expect(result.message).toBe('Orders with chats retrieved successfully');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(mockOrders.length);
    });
  });
});
