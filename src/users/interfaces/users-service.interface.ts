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
