import { User } from '@prisma/client';

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IAuthServiceLogin {
  email: string;
  password: string;
  res: any;
}

export interface IAuthServiceGetAccessToken {
  user: User;
  // res: any;
}

export interface IAuthServiceGetRefereshToken {
  user: User;
  // res: any;
}
