import { BaseQueryParameter } from '@/shared/base-query-parameter';
import { PermissionService } from './../permission/permission.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { DeleteResult, FindManyOptions, In, Not, Repository } from 'typeorm';
import { BaseResponseForPaging } from '@/shared/response-for-paging';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy) private policyRepository: Repository<Policy>,
    private permissionService: PermissionService,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const isExistingPolicy = await this.policyRepository.findOne({
      where: {
        name: createPolicyDto.name,
      },
    });

    if (isExistingPolicy)
      throw new BadRequestException('Policy already exists');

    const policy = this.policyRepository.create(createPolicyDto);

    if (createPolicyDto?.permissionIds?.length > 0) {
      const listPermission = await this.permissionService.findAllOtherService({
        where: {
          id: In(createPolicyDto.permissionIds),
        },
      });

      policy.permissions = listPermission;
    }

    return this.policyRepository.save(policy);
  }

  async findAll(
    query: BaseQueryParameter,
  ): Promise<BaseResponseForPaging<Policy>> {
    const { limit, offset, order, sort } = query;

    const [data, total]: [Policy[], number] =
      await this.policyRepository.findAndCount({
        relations: ['permissions'],
        select: {
          id: true,
          name: true,
          permissions: {
            id: true,
            resource: true,
            action: true,
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

  findOne(id: string): Promise<Policy> {
    return this.policyRepository.findOne({
      relations: ['permissions'],
      select: {
        id: true,
        name: true,
        permissions: {
          id: true,
          resource: true,
          action: true,
        },
      },
      where: {
        id,
      },
    });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: {
        id,
      },
    });

    if (!policy) throw new NotFoundException('Policy not found');

    const isExistingPolicy = this.policyRepository.findOne({
      where: {
        id: Not(id),
        name: updatePolicyDto.name,
      },
    });

    if (isExistingPolicy)
      throw new BadRequestException('Policy name already exists');

    if (updatePolicyDto?.permissionIds?.length > 0) {
      const listPermission = await this.permissionService.findAllOtherService({
        where: {
          id: In(updatePolicyDto.permissionIds),
        },
      });

      policy.permissions = listPermission;
    }

    return this.policyRepository.save(policy);
  }

  remove(id: string): Promise<DeleteResult> {
    return this.policyRepository.delete({
      id,
    });
  }

  async findAllOtherService(
    query?: FindManyOptions<Policy>,
  ): Promise<Policy[]> {
    return this.policyRepository.find(query);
  }
}
