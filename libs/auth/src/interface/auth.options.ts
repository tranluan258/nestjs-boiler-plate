import { IAccountService } from './account.service.interface';

export interface AuthOptions {
  imports?: any[];
  inject?: any[];
  useFactory?: (accountService: IAccountService) => IAccountService;
}
