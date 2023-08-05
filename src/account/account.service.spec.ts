import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { PermissionService } from '../permission/permission.service';
import { Policy } from '../policy/entities/policy.entity';
import { PolicyService } from '../policy/policy.service';
import { Role } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

describe('AccountService', () => {
  let accountService: AccountService;
  let accountRepository: Repository<Account>;

  const ACCOUNT_REPOSITORY_TOKEN = getRepositoryToken(Account);
  const mockRoleService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        RoleService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(RoleService)
      .useValue(mockRoleService)
      .compile();

    accountService = module.get<AccountService>(AccountService);
    accountRepository = module.get<Repository<Account>>(
      ACCOUNT_REPOSITORY_TOKEN,
    );
  });

  it('should be defined', () => {
    expect(accountService).toBeDefined();
  });

  it('account repository should be defined', () => {
    expect(accountRepository).toBeDefined();
  });

  it('create success', async () => {
    const createAccountDto: CreateAccountDto = {
      username: 'test',
      password: 'test',
      roleId: [],
    };
    const account: Account = {
      id: '1',
      username: 'test',
      password: 'test',
      roles: [],
      createdBy: '',
      updatedBy: '',
      createdAt: undefined,
      updatedAt: undefined,
    };

    jest.spyOn(accountRepository, 'create').mockImplementation(() => account);
    jest
      .spyOn(accountRepository, 'save')
      .mockImplementation(async () => account);

    expect(await accountService.create(createAccountDto)).toEqual(account);
  });

  it('create exist username', async () => {
    const createAccountDto: CreateAccountDto = {
      username: 'test',
      password: 'test',
      roleId: [],
    };
    const account: Account = {
      id: '1',
      username: 'test',
      password: 'test',
      roles: [],
      createdBy: '',
      updatedBy: '',
      createdAt: undefined,
      updatedAt: undefined,
    };

    jest
      .spyOn(accountRepository, 'findOne')
      .mockImplementation(async () => account);

    try {
      await accountService.create(createAccountDto);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('findAll', async () => {
    const result: {
      total: number;
      data: Account[];
    } = {
      total: 0,
      data: [],
    };

    jest
      .spyOn(accountRepository, 'findAndCount')
      .mockImplementation(async () => [result.data, result.total]);

    expect(await accountService.findAll({})).toEqual(result);
  });
});
