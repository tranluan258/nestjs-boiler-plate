import { JwtPayload } from './interface/jwt-payload.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  Account,
  IAccountService,
} from './interface/account.service.interface';
import { ACCOUNT_SERVICE } from './constant/constant';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(ACCOUNT_SERVICE) private accountService: IAccountService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Account | null> {
    const account = await this.accountService.findByUsername(username);
    if (!account) return null;

    const isMatch = bcrypt.compareSync(password, account?.password ?? '');
    if (!isMatch) return null;

    this.logger.log(`User ${username} logged in`);
    delete account.password;

    return account;
  }

  async login(jwtPayLoad: JwtPayload) {
    const payload = {
      username: jwtPayLoad.username,
      sub: jwtPayLoad.id,
      roles: jwtPayLoad.roles,
    };
    this.logger.log(`User ${jwtPayLoad.username} logged in`);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
