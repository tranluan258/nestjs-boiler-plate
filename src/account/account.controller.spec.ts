import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateResult } from 'typeorm';

describe('AccountController', () => {
  let controller: AccountController;

  const mockAccount: Account = {
    id: '1',
    username: 'test',
    password: 'test',
    roles: [],
  };

  const mockAccountService = {
    findAll: jest.fn().mockImplementation(
      async (): Promise<{
        data: Account[];
        total: number;
      }> => {
        return {
          data: [],
          total: 0,
        };
      },
    ),
    findOne: jest.fn().mockImplementation(async () => {
      return mockAccount;
    }),

    create: jest.fn().mockImplementation(async () => {
      return mockAccount;
    }),
    update: jest.fn().mockImplementation(async () => {
      return mockAccount;
    }),

    remove: jest.fn().mockImplementation(async () => {
      const updated: UpdateResult = {
        affected: 1,
        raw: '',
        generatedMaps: [],
      };
      return updated;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [AccountService],
    })
      .overrideProvider(AccountService)
      .useValue(mockAccountService)
      .compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll', async () => {
    const result: {
      total: number;
      data: Account[];
    } = {
      total: 0,
      data: [],
    };

    expect(await controller.findAll({})).toStrictEqual(result);

    expect(mockAccountService.findAll).toHaveBeenCalled();
  });

  it('findOne', async () => {
    const mockId = '1';
    const result: Account = {
      id: '1',
      username: 'test',
      password: 'test',
      roles: [],
    };

    expect(await controller.findOne(mockId)).toStrictEqual(result);
    expect(mockAccountService.findOne).toHaveBeenCalled();
  });

  it('create', async () => {
    const createAccountDto: CreateAccountDto = {
      username: 'test',
      password: 'test',
      roleId: [],
    };

    const resultController = {
      message: 'Account created successfully',
    };

    expect(await controller.create(createAccountDto)).toStrictEqual(
      resultController,
    );
    expect(mockAccountService.create).toHaveBeenCalled();
  });

  it('update', async () => {
    const mockId = '1';
    const updateAccountDto: UpdateAccountDto = {
      password: 'test',
      roleId: [],
    };

    const resultController = {
      message: 'Account updated successfully',
    };

    expect(await controller.update(mockId, updateAccountDto)).toStrictEqual(
      resultController,
    );
    expect(mockAccountService.update).toHaveBeenCalled();
  });

  it('remove', async () => {
    const mockId = '1';

    const resultController = {
      message: 'Account deleted successfully',
    };

    expect(await controller.remove(mockId)).toStrictEqual(resultController);
    expect(mockAccountService.remove).toHaveBeenCalled();
  });
});
