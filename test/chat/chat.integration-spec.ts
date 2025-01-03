import {
  INestApplication,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/utils/prisma';
import {
  createOrderAndChatRoom,
  deleteUser,
  signupAndLogin,
} from '../utils/test-utils';

describe('ChatService (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdUserId: string | null = null;
  let prismaService: PrismaService;
  let chatRoomId: string | null = null;
  let logger: Logger | undefined;
  let email = 'testuser2@example.com';
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

    const order = await createOrderAndChatRoom(app, authToken);

    chatRoomId = order.chatRoomId;
  });

  afterAll(async () => {
    if (createdUserId) {
      await deleteUser(prismaService, createdUserId);
    }
    await app.close();
  });

  it('should fetch chat history', async () => {
    return request(app.getHttpServer())
      .get(`/chat/${chatRoomId}/history`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        // Assertions for response structure
        expect(response.body).toHaveProperty('status', true);
        expect(response.body).toHaveProperty(
          'message',
          'Chat history fetched successfully',
        );
        const chats = response.body.data;
        expect(Array.isArray(chats)).toBe(true);
      });
  });

  it('should be able to close chat', async () => {
    return request(app.getHttpServer())
      .patch(`/chat/${chatRoomId}/close`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ summary: 'Chat ended, thanks' })
      .expect(HttpStatus.OK)
      .then((response) => {
        const { id, summary, isClosed, orderId } = response.body.data;

        // Assertions for response structure
        expect(response.body).toHaveProperty('status', true);
        expect(response.body).toHaveProperty(
          'message',
          'Chat successfully closed',
        );

        // Assertions for chat data
        expect(id).toBeDefined();
        expect(summary).toEqual('Chat ended, thanks');
        expect(orderId).toBeDefined();
        expect(isClosed).toBeDefined();
        expect(isClosed).toEqual(true);
      });
  });
});
