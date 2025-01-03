import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../utils/prisma';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { GetResponse } from '../utils/interface/response.interface';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  public async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<GetResponse<any>> {
    await this.authService.getUserById(userId);

    const { description, specifications, quantity, metadata } = createOrderDto;
    try {
      const result = await this.prismaService.$transaction(async (prisma) => {
        // Create the order
        const order = await prisma.order.create({
          data: {
            description,
            specifications,
            quantity,
            metadata,
            userId,
          },
        });

        // Create the chat room
        const chatRoom = await prisma.chatRoom.create({
          data: {
            orderId: order.id,
          },
        });

        return { order, chatRoom };
      });

      return {
        status: true,
        message: 'Order created successfully',
        data: {
          order: result.order,
          chatRoom: result.chatRoom,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating order',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  public async markOrderAsCompleted(
    userId: string,
    orderId: string,
  ): Promise<GetResponse<Order>> {
    try {
      await this.authService.getUserById(userId);

      const order = await this.prismaService.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new HttpException('Order not found.', HttpStatus.NOT_FOUND);
      }

      if (order.status !== OrderStatus.PROCESSING) {
        throw new HttpException(
          `Order must be in ${OrderStatus.PROCESSING} state to be marked as ${OrderStatus.COMPLETED}. Current state: ${order.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedOrder = await this.prismaService.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      return {
        status: true,
        message: 'Order successfully completed.',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while marking order as completed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  public async getOrders(): Promise<GetResponse<Order[]>> {
    try {
      const orders = await this.prismaService.order.findMany({
        include: {
          chatRoom: true,
        },
      });

      return {
        status: true,
        message: 'Orders with chats retrieved successfully',
        data: orders,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while getting orders',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
