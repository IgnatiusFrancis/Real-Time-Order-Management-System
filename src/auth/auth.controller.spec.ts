import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createAuthDto, loginDto } from './dto/mockData/mockAuthData';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  /************************ MOCK userSignup *****************************/
  describe('userSignup', () => {
    it('should create a new user successfully', async () => {
      const expectedResponse = {
        success: true,
        message: 'Signup successful',
        data: {
          id: '42a813e6-af77-4192-bf03-8858543678d9',
          email: createAuthDto.email,
          role: UserRole.USER,
        },
      };

      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.userSignup(createAuthDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signup).toHaveBeenCalledWith(createAuthDto);
    });

    it('should handle signup failure', async () => {
      mockAuthService.signup.mockRejectedValue(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.userSignup(createAuthDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  /************************ MOCK adminSignup *****************************/
  describe('adminSignup', () => {
    it('should create a new admin successfully', async () => {
      const expectedResponse = {
        success: true,
        message: 'Signup successful',
        data: {
          id: '42a813e6-af77-4192-bf03-8858a21678d9',
          email: createAuthDto.email,
          role: UserRole.ADMIN,
        },
      };

      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.adminSignup(createAuthDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signup).toHaveBeenCalledWith(
        createAuthDto,
        UserRole.ADMIN,
      );
    });

    it('should handle admin signup failure', async () => {
      mockAuthService.signup.mockRejectedValue(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.adminSignup(createAuthDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  /************************ MOCK login *****************************/
  describe('login', () => {
    it('should authenticate user successfully', async () => {
      const expectedResponse = {
        success: true,
        message: 'Login successful',
        data: {
          id: '42a813e6-af77-4192-bf03-8858a21678d9',
          email: loginDto.email,
          token: 'jwt-token',
        },
      };

      mockAuthService.signin.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signin).toHaveBeenCalledWith(loginDto);
    });

    it('should handle authentication failure', async () => {
      mockAuthService.signin.mockRejectedValue(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);
    });
  });
});
