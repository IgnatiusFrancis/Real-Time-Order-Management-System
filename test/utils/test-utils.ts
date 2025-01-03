import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../src/utils/prisma';
import { createOrderDto } from './mockOrderDto';

const logger = new Logger('Test Cleanup');

/**
 * Deletes a user by ID from the database if they exist.
 * @param prismaService - Instance of the Prisma service to interact with the database.
 * @param userId - The ID of the user to delete.
 */

export const deleteUser = async (
  prismaService: PrismaService,
  userId: string,
): Promise<void> => {
  try {
    await prismaService.user.delete({
      where: { id: userId },
    });
    logger.debug(`User with ID ${userId} deleted after tests.`);
  } catch (error) {
    // Ignore if user does not exist (for example, if creation failed)
    logger.warn(
      `User deletion failed for ID ${userId} or user does not exist.`,
    );
  }
};

export const signupAndLogin = async (
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ id: string; token: string }> => {
  // Sign up the user
  await request(app.getHttpServer())
    .post('/auth/admin/signup')
    .send({ email, password })
    .expect(201);

  // Login and return token
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return {
    id: response.body.data.id,
    token: response.body.data.token,
  };
};

export const createOrderAndChatRoom = async (
  app: INestApplication,
  token: string,
): Promise<{ orderId: string; chatRoomId: string }> => {
  const response = await request(app.getHttpServer())
    .post('/order')
    .set('Authorization', `Bearer ${token}`)
    .send(createOrderDto)
    .expect(201);

  const { id: orderId } = response.body.data.order;
  const { id: chatRoomId } = response.body.data.chatRoom;

  return { orderId, chatRoomId };
};
