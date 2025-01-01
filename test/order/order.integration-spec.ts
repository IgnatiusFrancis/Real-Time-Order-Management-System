// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from './../../src/app.module';
// import { PrismaService } from '../../src/utils/prisma';

// describe('OrderService (Integration)', () => {
//   let app: INestApplication;
//   let prismaService: PrismaService;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     app.useGlobalPipes(
//       new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
//     );

//     await app.init();

//     prismaService = moduleFixture.get<PrismaService>(PrismaService);
//   });

//   afterAll(async () => {
//     await prismaService.order.deleteMany(); // Cleanup test data
//     await app.close();
//   });

//   describe('POST /orders', () => {
//     it('should create a new order with a chat room', async () => {
//       const userId = 'test-user-id'; // Mocked user ID
//       const createOrderDto = {
//         description: 'Test order',
//         specifications: JSON.stringify({ size: 'L', color: 'blue' }),
//         quantity: 2,
//         metadata: JSON.stringify({ priority: 'high' }),
//       };

//       const response = await request(app.getHttpServer())
//         .post('/orders')
//         .send({ ...createOrderDto, userId }) // Assuming the userId is passed in the body
//         .expect(201);

//       expect(response.body).toHaveProperty('status', true);
//       expect(response.body).toHaveProperty(
//         'message',
//         'Order created successfully',
//       );
//       expect(response.body.data.order).toHaveProperty(
//         'description',
//         createOrderDto.description,
//       );
//       expect(response.body.data.chatRoom).toHaveProperty(
//         'orderId',
//         response.body.data.order.id,
//       );
//     });
//   });
// });
