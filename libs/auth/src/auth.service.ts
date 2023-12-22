import { JwtPayload } from './interface/jwt-payload.interface';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IAccountService } from './interface/account.service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ACCOUNT_SERVICE') private accountService: IAccountService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const account = await this.accountService.findByUsername(username);
    if (!account) return null;

    const isMatch = bcrypt.compareSync(password, account.password);
    if (!isMatch) return null;

    delete account.password;

    return account;
  }

  async login(jwtPayLoad: JwtPayload) {
    const payload = {
      username: jwtPayLoad.username,
      sub: jwtPayLoad.id,
      roles: jwtPayLoad.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
