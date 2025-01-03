import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/utils/prisma';
import { OrderStatus } from '@prisma/client';
import { deleteUser, signupAndLogin } from '../utils/test-utils';
import { createOrderDto } from '../utils/mockOrderDto';

describe('OrderService (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdUserId: string | null = null;
  let orderId: string | null = null;
  let prismaService: PrismaService;
  let logger: Logger | undefined;
  let email = 'testuser1@example.com';
  let password = 'testpassword';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    logger = new Logger('TestLogger');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Ensure no pre-existing user to avoid conflicts
    const existingUser = await prismaService.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      await deleteUser(prismaService, existingUser.id);
    }

    // Create and authenticate a test user
    const res = await signupAndLogin(app, email, password);

    authToken = res.token;
    createdUserId = res.id;
  });

  afterAll(async () => {
    if (createdUserId) {
      await deleteUser(prismaService, createdUserId);
    }
    await app.close();
  });

  describe('POST /order', () => {
    it('should create a new order with a chat room', async () => {
      const response = await request(app.getHttpServer())
        .post('/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createOrderDto)
        .expect(201);
      orderId = response.body.data.order.id;
      expect(response.body).toHaveProperty('status', true);
      expect(response.body).toHaveProperty(
        'message',
        'Order created successfully',
      );
      expect(response.body.data.order).toHaveProperty(
        'description',
        createOrderDto.description,
      );
      expect(response.body.data.chatRoom).toHaveProperty(
        'orderId',
        response.body.data.order.id,
      );
    });
  });

  it('should fetch orders', async () => {
    return request(app.getHttpServer())
      .get('/order')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .then((res) => {
        const orders = res.body.data;
        expect(Array.isArray(orders)).toBe(true);

        orders.forEach((order) => {
          const { description, id, status } = order;

          // Ensure at least one order exists and retrieve its ID
          expect(orders.length).toBeGreaterThan(0);

          // Assertions for each order
          expect(id).toBeDefined();
          expect(description).toBeDefined();
          expect(status).toBeDefined();
          expect([
            OrderStatus.REVIEW,
            OrderStatus.COMPLETED,
            OrderStatus.PROCESSING,
          ]).toContain(status);
        });
      });
  });

  it('should fail to mark an order as completed if not in PROCESSING state', async () => {
    return request(app.getHttpServer())
      .patch(`/order/${orderId}/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body.message).toEqual(
          `Order must be in ${OrderStatus.PROCESSING} state to be marked as ${OrderStatus.COMPLETED}. Current state: ${OrderStatus.REVIEW}`,
        );
      });
  });
});
