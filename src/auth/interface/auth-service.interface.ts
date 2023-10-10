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
}

export interface IAuthServiceGetRefereshToken {
  user: User;
}
