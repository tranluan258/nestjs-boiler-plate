import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { async } from 'rxjs';
import { AuthService } from './auth.service';
import { ACCOUNT_SERVICE } from './constant/constant';
import { JwtPayload } from './interface/jwt-payload.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let mockAccountService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: ACCOUNT_SERVICE, useValue: mockAccountService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('validateUser should return user', async () => {
    const result = { id: 1, username: 'test', password: 'test' };
    jest
      .spyOn(authService, 'validateUser')
      .mockImplementation(async () => result);
    expect(await authService.validateUser('test', 'test')).toBe(result);
  });

  it('login should return token', async () => {
    const result = {
      accessToken: 'test',
    };

    const user: JwtPayload = {
      id: '1',
      username: 'test',
      roles: [],
    };

    jest.spyOn(authService, 'login').mockImplementation(async () => result);
    expect(await authService.login(user)).toBe(result);
  });
});
