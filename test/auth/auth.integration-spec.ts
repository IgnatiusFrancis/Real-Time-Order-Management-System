import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/utils/prisma';
import { UserRole } from '@prisma/client';

describe('Authentication System', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let logger: Logger | undefined;
  let authToken: string;
  let createdUserId: string | null = null;
  const userEmail = 'user@example.com';
  const userPassword = 'password';
  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    logger = new Logger('TestLogger');
    moduleFixture.useLogger(logger);

    // Clean up any pre-existing users
    // await prismaService.user.deleteMany({
    //   where: {
    //     OR: [{ email: userEmail }, { email: adminEmail }],
    //   },
    // });

    await app.init();
  });

  // Cleanup: delete the user created in the tests db
  afterAll(async () => {
    if (createdUserId) {
      try {
        await prismaService.user.deleteMany({
          where: {
            OR: [{ email: userEmail }, { email: adminEmail }],
          },
        });
        logger.debug('User deleted after tests.');
      } catch (error) {
        // Ignore if user does not exist (for example, if creation failed)
        logger.warn('User deletion failed or user does not exist.');
      }
    }
    await app.close();
  });

  /******************** SIGNUP USER *******************/
  it('handles User signup request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/user/signup')
      .send({ email: userEmail, password: userPassword })
      .expect(201)
      .then((res) => {
        const { id, email: responseEmail, role } = res.body.result;
        createdUserId = id;

        // Ensure response data is valid
        expect(id).toBeDefined();
        expect(responseEmail).toEqual(userEmail);
        expect(role).toBeDefined();
        expect(role).toEqual(UserRole.USER);
      });
  });

  /******************** SIGNUP ADMIN *******************/
  it('handles Admin signup request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/admin/signup')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201)
      .then((res) => {
        const { id, email: responseEmail, role } = res.body.result;
        createdUserId = id;

        expect(id).toBeDefined();
        expect(responseEmail).toEqual(adminEmail);
        expect(role).toBeDefined();
        expect(role).toEqual(UserRole.ADMIN);
      });
  });

  /******************** SIGNIN REQUEST *******************/
  it('handles signin request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(201)
      .then((res) => {
        const { token, id } = res.body.result;
        authToken = token;
        expect(id).toBeDefined();
        expect(token).toBeDefined();
      });
  });

  // /******************** SIGNIN USER *******************/
  // it('handles a signin request', async () => {
  //   return await request(app.getHttpServer())
  //     .post('/auth/signin')
  //     .send({ email, password })
  //     .expect(201)
  //     .then((res) => {
  //       const { id, email } = res.body.result;
  //       const { token } = res.body.result;
  //       authToken = token;

  //       expect(id).toBeDefined();
  //       expect(email).toEqual(email);
  //       expect(token).toBeDefined();
  //     });
  // }, 1000);

  // /******************** FETCH ALL ORDERS *******************/
  // it('It should fetch all orders', async () => {
  //   const result = await request(app.getHttpServer())
  //     .get(`/orders`)
  //     .set('Authorization', `Bearer ${authToken}`)
  //     .expect(200);
  // }, 10000);
});
