// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';

// describe('UsersService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('TC06: should not create a user if email is invalid', async () => {
//     const createUserDto = { email: 'invalidEmail' };
//     await expect(service.create(createUserDto)).rejects.toThrow();
//   });

//   it('TC06: should not create a user if password and confirmPassword do not match', async () => {
//     const createUserDto = {
//       password: 'password1',
//       confirmPassword: 'password2' /* ... */,
//     };
//     await expect(service.create(createUserDto)).rejects.toThrow();
//   });
// });
