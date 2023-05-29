import { BaseQueryParameter } from './../shared/base-query-parameter';
import { PolicyService } from './../policy/policy.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindManyOptions, In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private policyService: PolicyService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const isExistingRole = await this.roleRepository.findOne({
      where: {
        name: createRoleDto.name,
      },
    });

    if (isExistingRole) throw new BadRequestException('Role already exists');

    const role = this.roleRepository.create(createRoleDto);

    if (createRoleDto?.policyIds?.length > 0) {
      const listPolicy = await this.policyService.findAllOtherService({
        where: {
          id: In(createRoleDto.policyIds),
        },
      });

      role.policies = listPolicy;
    }

    return this.roleRepository.save(role);
  }

  async findAll(query: BaseQueryParameter) {
    const { limit, offset, order, sort } = query;

    const [data, total]: [Role[], number] =
      await this.roleRepository.findAndCount({
        relations: ['policies'],
        select: {
          id: true,
          name: true,
          policies: {
            id: true,
            name: true,
          },
        },
        take: limit,
        skip: offset,
        order: {
          [sort]: order,
        },
      });

    return {
      data,
      total,
    };
  }

  findOne(id: string) {
    return this.roleRepository.findOne({
      relations: ['policies'],
      select: {
        id: true,
        name: true,
        policies: {
          id: true,
          name: true,
        },
      },
      where: {
        id,
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
    });

    if (!role) throw new NotFoundException('Role not found');

    const isExistingRole = this.roleRepository.findOne({
      where: {
        id: Not(id),
        name: updateRoleDto.name,
      },
    });

    if (isExistingRole)
      throw new BadRequestException('Role name already exists');

    if (updateRoleDto?.policyIds?.length > 0) {
      const listPolicy = await this.policyService.findAllOtherService({
        where: {
          id: In(updateRoleDto.policyIds),
        },
      });

      role.policies = listPolicy;
    }

    role.name = updateRoleDto.name;

    return this.roleRepository.save(role);
  }

  findAllOtherService(query: FindManyOptions<Role>) {
    return this.roleRepository.find(query);
  }

  remove(id: string) {
    return this.roleRepository.delete({
      id,
    });
  }
}
