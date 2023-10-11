export interface IUsersServiceCreate {
  email: string;
  password: string;
  nickname: string;
  intro: string;
  confirm: string;
}

export interface IUsersServiceFindByEmail {
  email: string;
}
