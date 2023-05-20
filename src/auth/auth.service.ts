import { JwtPayload } from './interface/jwt-payload.interface';
import { AccountService } from './../account/account.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
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
