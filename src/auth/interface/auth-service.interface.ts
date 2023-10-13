// export interface IUsersServiceCreate {
//   email: string;
//   name: string;
//   password: string;
// }

import { User } from '@prisma/client';

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IAuthServiceLogin {
  email: string;
  password: string;
}

export interface IAuthServiceGetAccessToken {
  user: User;
  res: any; // res 매개 변수 추가
}

export interface IAuthServiceGetRefereshToken {
  user: User;
  res: any; // res 매개 변수 추가
}
