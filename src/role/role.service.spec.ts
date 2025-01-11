import { PolicyService } from '@/policy/policy.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let roleService: RoleService;
  let roleRepository: Repository<Role>;

  const ROLE_REPOSITORY_TOKEN = getRepositoryToken(Role);
  const mockPolicyService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        PolicyService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(PolicyService)
      .useValue(mockPolicyService)
      .compile();

    roleService = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(ROLE_REPOSITORY_TOKEN);
  });

  it('roleRepository should be defined', () => {
    expect(roleRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(roleService).toBeDefined();
  });

  it('should be able to create a role', async () => {
    const createRoleDto: CreateRoleDto = {
      name: 'admin',
      policyIds: [],
    };

    const role: Role = {
      id: '1',
      name: 'admin',
      policies: [],
      accounts: [],
    };

    jest.spyOn(roleRepository, 'create').mockImplementation(() => role);
    jest.spyOn(roleRepository, 'save').mockImplementation(async () => role);

    expect(await roleService.create(createRoleDto)).toEqual(role);
  });

  it('findAllAndCount', async () => {
    const result: {
      data: Role[];
      total: number;
    } = {
      data: [],
      total: 0,
    };

    jest
      .spyOn(roleRepository, 'findAndCount')
      .mockImplementation(async () => [result.data, result.total]);

    expect(await roleService.findAll({})).toEqual(result);
  });

  it('findOne', async () => {
    const role: Role = {
      id: '1',
      name: 'admin',
      policies: [],
      accounts: [],
    };

    jest.spyOn(roleRepository, 'findOne').mockImplementation(async () => role);

    expect(await roleService.findOne('1')).toEqual(role);
  });

  it('update not found', async () => {
    jest.spyOn(roleRepository, 'findOne').mockImplementation(async () => null);

    try {
      await roleService.update('1', {});
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('update role name existed', async () => {
    jest.spyOn(roleRepository, 'findOne').mockImplementation(async () => {
      return {
        id: '1',
        name: 'admin',
        policies: [],
        accounts: [],
      };
    });

    try {
      await roleService.update('1', {});
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('update success', async () => {
    const findRole: Role = {
      id: '1',
      name: 'admin',
      policies: [],
      accounts: [],
    };
    const notExistedRole = null;

    roleRepository.findOne = jest
      .fn()
      .mockReturnValueOnce(await Promise.resolve(findRole))
      .mockReturnValueOnce(await Promise.resolve(notExistedRole));

    const updateRoleDto: CreateRoleDto = {
      name: 'admin',
      policyIds: [],
    };

    const updatedRole: Role = {
      id: '1',
      name: 'admin',
      policies: [],
      accounts: [],
    };

    jest
      .spyOn(roleRepository, 'save')
      .mockImplementation(async () => updatedRole);

    expect(await roleService.update('1', updateRoleDto)).toEqual(updatedRole);
  });

  it('remove not found', async () => {
    const deleteResult = {
      affected: 0,
      raw: {},
    };
    jest
      .spyOn(roleRepository, 'delete')
      .mockImplementation(async () => deleteResult);

    expect(await roleService.remove('1')).toEqual(deleteResult);
  });

  it('remove success', async () => {
    const deleteResult = {
      affected: 1,
      raw: {},
    };
    jest
      .spyOn(roleRepository, 'delete')
      .mockImplementation(async () => deleteResult);

    expect(await roleService.remove('1')).toEqual(deleteResult);
  });
});
