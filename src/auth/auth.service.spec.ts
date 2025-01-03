import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { mockUser, signInDto, signUpDto } from './dto/mockData/mockAuthData';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtAuthService: JwtAuthService;
  let prismaService: PrismaService;

  const mockJwtAuthService = {
    generateAuthToken: jest.fn().mockReturnValue('mock-token'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

    authService = module.get<AuthService>(AuthService);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  /************************ MOCK signin *****************************/
  describe('signin', () => {
    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
    });

    it('should successfully sign in a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.signin(signInDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.data.token).toBeDefined();
      expect(result.data.email).toBe(mockUser.email);
    });

    it('should throw an error if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.signin(signInDto)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(authService.signin(signInDto)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST),
      );
    });
  });

  /************************ MOCK signup *****************************/
  describe('signup', () => {
    beforeEach(() => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
    });

    it('should successfully create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: signUpDto.email,
      });

      const result = await authService.signup(signUpDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Signup successful');
      expect(result.data.email).toBe(signUpDto.email);
    });

    it('should throw an error if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new HttpException(
          'User with this email already exists',
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should create admin user when admin role is specified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });

      const result = await authService.signup(signUpDto, UserRole.ADMIN);

      expect(result.data.role).toBe(UserRole.ADMIN);
    });
  });
});
