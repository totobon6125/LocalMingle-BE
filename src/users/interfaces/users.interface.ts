import { User } from '@prisma/client';

export interface IUsersServiceCreate {
  email: string;
  password: string;
  nickname: string;
  intro: string;
  confirmPassword: string;
}

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IUsersServiceFindByNickname {
  nickname: string;
}

// request에 user 객체를 추가하기 위한 인터페이스
export interface RequestWithUser extends Request {
  user: User;
}
