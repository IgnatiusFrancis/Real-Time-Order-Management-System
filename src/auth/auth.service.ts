import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async signin(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.verifyUser(
        createAuthDto.email,
        createAuthDto.password,
      );

      const token = this.jwtAuthService.generateAuthToken(user.id, user.role);

      return this.formatLoginResponse(user, token);
    } catch (error) {
      throw error;
    }
  }

  async signup(createAuthDto: CreateAuthDto, role?: UserRole) {
    try {
      await this.checkUserExists(createAuthDto.email);

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const newUser = await this.createUser(
        createAuthDto.email,
        hashedPassword,
        role ? role : UserRole.USER,
      );

      return this.formatSignupResponse(newUser);
    } catch (error) {
      throw error;
    }
  }

  private async verifyUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);

    this.checkUserExistence(user);

    await this.checkPasswordMatch(password, user.password);

    return user;
  }

  private async checkUserExists(email: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async createUser(email: string, password: string, role?: UserRole) {
    return await this.prismaService.user.create({
      data: {
        email,
        password,
        role,
      },
    });
  }

  public async getUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    this.checkUserExistence(user);

    return user;
  }

  private checkUserExistence(user: User) {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  private async checkPasswordMatch(password: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private formatLoginResponse(user: User, token: string) {
    const { password, ...data } = user;
    return {
      success: true,
      message: 'Login successful',
      data: {
        ...data,
        token,
      },
    };
  }

  private formatSignupResponse(newUser: User) {
    const { password, ...data } = newUser;

    const c = {
      success: true,
      message: 'Signup successful',
      data: {
        ...data,
      },
    };

    return c;
  }
}
