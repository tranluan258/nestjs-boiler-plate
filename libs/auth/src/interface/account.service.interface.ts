export interface Account {
  id: string;
  username: string;
  password?: string;
}

export interface IAccountService {
  findByUsername(username: string): Promise<Account>;
}
