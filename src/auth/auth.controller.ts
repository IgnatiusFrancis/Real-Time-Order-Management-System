import { Controller, Post, Body, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /************************ USER SIGNUP *****************************/
  @Post('user/signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  async userSignup(@Body() createAuthDto: CreateAuthDto): Promise<any> {
    return await this.authService.signup(createAuthDto);
  }

  /************************ ADMIN SIGNUP *****************************/
  @Post('admin/signup')
  @ApiOperation({ summary: 'Register admin' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin successfully registered.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
  async adminSignup(
    @Body() createAuthDto: CreateAuthDto,
    role = UserRole.ADMIN,
  ): Promise<any> {
    return await this.authService.signup(createAuthDto, role);
  }

  /************************ LOGIN *****************************/
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async login(@Body() createAuthDto: CreateAuthDto): Promise<any> {
    return await this.authService.signin(createAuthDto);
  }
}
