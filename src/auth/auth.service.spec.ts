// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { PrismaService } from './../prisma/prisma.service';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from 'src/users/users.service';
// import * as bcrypt from 'bcrypt';
// import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// describe('AuthService', () => {
//   let authService: AuthService;
//   // let prismaService: PrismaService;
//   // let jwtService: JwtService;
//   let usersService: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService, PrismaService, JwtService, UsersService],
//     }).compile();

//     authService = module.get<AuthService>(AuthService);
//     // prismaService = module.get<PrismaService>(PrismaService);
//     // jwtService = module.get<JwtService>(JwtService);
//     usersService = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(authService).toBeDefined();
//   });

//   describe('login', () => {
//     it('should successfully login with valid credentials', async () => {
//       const email = 'test@example.com';
//       const password = 'abc123456789!';

//       const mockUser = {
//         userId: 1,
//         email,
//         password: await bcrypt.hash(password, 10),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         deletedAt: null,
//         refreshToken: 'sampleRefreshToken',
//       };
//       jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

//       const result = await authService.login({ email, password, res: {} });

//       expect(result.accessToken).toBeDefined();
//       expect(result.refreshToken).toBeDefined();
//       expect(result.userId).toBe(1);
//     });

//     it('should return UnauthorizedException with incorrect password', async () => {
//       const email = 'test@example.com';
//       const password = 'abc123456789!';

//       const mockUser = {
//         userId: 1,
//         email,
//         password: await bcrypt.hash(password, 10),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         deletedAt: null,
//         refreshToken: 'sampleRefreshToken',
//       };
//       jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

//       try {
//         await authService.login({ email, password, res: {} });
//       } catch (error) {
//         expect(error.status).toBe(401);
//         expect(error.message).toBe(UnauthorizedException);
//       }
//     });

//     it('should return NotFoundException with non-existent email', async () => {
//       const email = 'nonexistent@example.com';
//       const password = 'password123';

//       jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

//       try {
//         await authService.login({ email, password, res: {} });
//       } catch (error) {
//         expect(error.status).toBe(404);
//         expect(error.message).toBe(NotFoundException);
//       }
//     });

//     it('should return UnauthorizedException when user is deleted', async () => {
//       const email = 'test@example.com';
//       const password = 'password123';

//       const mockUser = {
//         userId: 1,
//         email,
//         password: await bcrypt.hash(password, 10),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         deletedAt: new Date(), // Deleted user
//         refreshToken: 'sampleRefreshToken',
//       };
//       jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

//       try {
//         await authService.login({ email, password, res: {} });
//       } catch (error) {
//         expect(error.status).toBe(401);
//         expect(error.message).toBe(UnauthorizedException);
//       }
//     });
//   });
// });
