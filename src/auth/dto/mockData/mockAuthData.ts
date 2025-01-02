import { User, UserRole } from '@prisma/client';
import { CreateAuthDto } from '../create-auth.dto';

export const createAuthDto: CreateAuthDto = {
  email: 'francis@gmail.com',
  password: 'password123',
};

export const createAdminAuthDto: CreateAuthDto = {
  email: 'francis@gmail.com',
  password: 'adminpass123',
};

export const loginDto: CreateAuthDto = {
  email: 'francis@gmail.com',
  password: 'password123',
};

export const mockUser: User = {
  id: '2uus7sndnd2nnn2j-sksjs-ddmrre',
  email: 'francis@gmail.com',
  password: 'hashedPassword',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const signInDto = {
  email: 'francis@gmail.com',
  password: 'password123',
};

export const signUpDto = {
  email: 'francis@gmail.com',
  password: 'password123',
};
