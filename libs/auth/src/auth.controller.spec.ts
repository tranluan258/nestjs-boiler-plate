import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    validateUser: jest.fn().mockImplementation(async () => {
      return {
        id: '1',
        username: 'test',
        password: 'test',
        roles: [],
      };
    }),
    login: jest.fn().mockImplementation(async () => {
      return {
        access_token: 'test',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login', async () => {
    const result = {
      access_token: 'test',
    };

    const user = {
      id: '1',
      username: 'test',
      password: 'test',
      roles: [],
    };

    expect(
      await controller.login({ username: 'test', password: 'test' }, user),
    ).toEqual(result);
  });
});
