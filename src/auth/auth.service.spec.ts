import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../utils/prisma';
import { mockAuthDto } from '../utils/mockData/mockAuthData/mock';
import { JwtAuthService } from '../utils/token.generators';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    /******************** This will always return true for bcypt *******************/
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtAuthService,
        ConfigService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockReturnValue(mockAuthDto),
              findUnique: jest.fn((args) => {
                console.log(args);
                if (args.where.email === mockAuthDto.email) {
                  if (args.include) {
                    // For sign-in: return mock user
                    return mockAuthDto;
                  }
                  // For sign-up: user does not exist
                  return null;
                }
                return null;
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should sign up successfully', async () => {
    // Mock the prismaService.user.findUnique method
    const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');

    // Call the service method
    const result = await service.signup(mockAuthDto);

    // Assertions
    expect(result).toEqual({
      success: true,
      message: 'Signup successful',
      result: {
        email: mockAuthDto.email,
        subscriptionActive: mockAuthDto.subscriptionActive,
      },
    });

    // Verify findUniqueSpy calls
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { email: mockAuthDto.email },
    });
    expect(findUniqueSpy).toHaveBeenCalledTimes(1);

    // Verify create method was called
    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email: mockAuthDto.email,
        password: expect.any(String),
      },
    });
    expect(prismaService.user.create).toHaveBeenCalledTimes(1);
  });

  it('should sign in successfully', async () => {
    // Mock the prismaService.user.findUnique method
    const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');

    // Call the service method
    const result = await service.signin(mockAuthDto);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');
    expect(result.result).toBeDefined();

    // Verify findUniqueSpy calls
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { email: mockAuthDto.email },
      include: { images: true, subscriptions: true },
    });
    expect(findUniqueSpy).toHaveBeenCalledTimes(1);
  });
});
