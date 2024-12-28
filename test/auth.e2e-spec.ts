import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/utils/prisma';

describe('Authentication System', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let logger: Logger | undefined;
  let authToken: string;
  let createdUserId: string | null = null;
  const email = 'jeff@gmail.com';
  const password = 'password';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    logger = new Logger('TestLogger');
    moduleFixture.useLogger(logger);

    await app.init();
  });

  // Cleanup: delete the user created in the tests
  afterAll(async () => {
    if (createdUserId) {
      await prismaService.user.delete({ where: { id: createdUserId } });
    }
    logger.debug('After all hook called');
    await app.close();
  });

  /******************** SIGNUP USER *******************/
  it('handles a signup request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { id, email, subscriptionActive } = res.body.result;
        createdUserId = id;

        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(subscriptionActive).toBeDefined();
      });
  }, 1000);

  /******************** SIGNIN USER *******************/
  it('handles a signin request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body.result;
        const { token } = res.body.result;
        authToken = token;

        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(token).toBeDefined();
      });
  }, 1000);

  /******************** FETCH ALL ORDERS *******************/
  it('It should fetch all orders', async () => {
    const result = await request(app.getHttpServer())
      .get(`/orders`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  }, 10000);
});
