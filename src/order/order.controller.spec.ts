import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { User, UserRole, OrderStatus } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockCreateOrderData, mockOrder } from './dto/mockData/mockOrderData';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';
import { mockUser } from '../auth/dto/mockData/mockAuthData';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let jwtAuthService: JwtAuthService;
  let prismaService: PrismaService;

  const mockAdminUser: User = {
    ...mockUser,
    role: UserRole.ADMIN,
  };

  const mockJwtAuthService = {
    generateAuthToken: jest.fn().mockReturnValue('mock-token'),
  };

  const mockOrderService = {
    createOrder: jest.fn(),
    markOrderAsCompleted: jest.fn(),
    getOrders: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: JwtAuthService,
          useValue: mockJwtAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  /************************ MOCK  create*****************************/
  describe('create', () => {
    it('should create a new order successfully', async () => {
      const expectedResponse = {
        status: true,
        message: 'Order created successfully',
        data: {
          order: mockOrder,
          chatRoom: { id: 'wytsnccoco', orderId: mockOrder.id },
        },
      };

      mockOrderService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockUser, mockCreateOrderData);

      expect(result).toEqual(expectedResponse);
      expect(orderService.createOrder).toHaveBeenCalledWith(
        mockUser.id,
        mockCreateOrderData,
      );
    });

    it('should handle order creation failure', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new HttpException('Creation failed', HttpStatus.BAD_REQUEST),
      );

      await expect(
        controller.create(mockUser, mockCreateOrderData),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  markAsCompleted*****************************/
  describe('markAsCompleted', () => {
    const orderId = 'hhsystshdn';

    it('should mark order as completed when admin requests', async () => {
      const expectedResponse = {
        status: true,
        message: 'Order successfully completed.',
        data: { ...mockOrder, status: OrderStatus.COMPLETED },
      };

      mockOrderService.markOrderAsCompleted.mockResolvedValue(expectedResponse);

      const result = await controller.markAsCompleted(mockAdminUser, orderId);

      expect(result).toEqual(expectedResponse);
      expect(orderService.markOrderAsCompleted).toHaveBeenCalledWith(
        mockAdminUser.id,
        orderId,
      );
    });

    it('should handle completion failure', async () => {
      mockOrderService.markOrderAsCompleted.mockRejectedValue(
        new HttpException('Order not found', HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.markAsCompleted(mockAdminUser, orderId),
      ).rejects.toThrow(HttpException);
    });
  });

  /************************ MOCK  getOrders*****************************/
  describe('getOrders', () => {
    it('should return all orders successfully', async () => {
      const expectedResponse = {
        status: true,
        message: 'Orders fetched successfully',
        data: [mockOrder],
      };

      mockOrderService.getOrders.mockResolvedValue(expectedResponse);

      const result = await controller.getOrders(mockUser);

      expect(result).toEqual(expectedResponse);
      expect(orderService.getOrders).toHaveBeenCalled();
    });

    it('should handle fetch failure', async () => {
      mockOrderService.getOrders.mockRejectedValue(
        new HttpException('Fetch failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      await expect(controller.getOrders(mockUser)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
