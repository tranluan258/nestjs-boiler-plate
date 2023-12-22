export interface IAccountService {
  findByUsername(username: string): Promise<any>;
}
