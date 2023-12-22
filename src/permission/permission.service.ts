import { BaseQueryParameter } from '@/shared/base-query-parameter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { FindManyOptions, Not, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const isExistingPermission = await this.permissionRepository.findOne({
      where: {
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });

    if (isExistingPermission)
      throw new BadRequestException('Permission already exists');

    const permission = this.permissionRepository.create(createPermissionDto);

    return this.permissionRepository.save(permission);
  }

  async findAll(query: BaseQueryParameter) {
    const { limit, offset, order, sort } = query;

    const [data, total]: [Permission[], number] =
      await this.permissionRepository.findAndCount({
        select: ['id', 'resource', 'action'],
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

  findAllOtherService(query?: FindManyOptions<Permission>) {
    return this.permissionRepository.find(query);
  }

  findOne(id: string) {
    return this.permissionRepository.findOne({
      where: {
        id,
      },
    });
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const isExistingPermission = this.permissionRepository.findOne({
      where: {
        id: Not(id),
        resource: updatePermissionDto.resource,
        action: updatePermissionDto.action,
      },
    });

    if (isExistingPermission)
      throw new BadRequestException('Permission already exists');

    return this.permissionRepository.update(id, updatePermissionDto);
  }

  remove(id: string) {
    return this.permissionRepository.delete(id);
  }
}
