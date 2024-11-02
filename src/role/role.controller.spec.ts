import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRoleService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [RoleService],
    })
      .overrideProvider(RoleService)
      .useValue(mockRoleService)
      .compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(roleService).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        policyIds: [],
      };
      const role: Role = {
        id: '1',
        name: 'admin',
        policies: [],
        accounts: [],
      };
      jest.spyOn(roleService, 'create').mockResolvedValue(role);
      expect(await controller.create(dto)).toBe(role);
    });
  });
});
