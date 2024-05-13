import { RoleService } from './../role/role.service';
import { BaseQueryParameter } from './../shared/base-query-parameter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private roleService: RoleService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const isExistingAccount = await this.accountRepository.findOne({
      where: {
        username: createAccountDto.username,
      },
    });

    if (isExistingAccount)
      throw new BadRequestException('Account already exists');

    const account = this.accountRepository.create(createAccountDto);
    if (createAccountDto.roleId.length > 0) {
      const roles = await this.roleService.findAllOtherService({
        where: {
          id: In(createAccountDto.roleId),
        },
      });
      account.roles = roles;
    }

    const hashPassword = bcrypt.hashSync(account.password, 10);
    account.password = hashPassword;
    return this.accountRepository.save(account);
  }

  async findAll(query: BaseQueryParameter) {
    const { limit, offset, order, sort } = query;

    const [data, total] = await this.accountRepository.findAndCount({
      relations: {
        roles: {
          policies: {
            permissions: true,
          },
        },
      },
      select: {
        id: true,
        username: true,
        password: false,
        roles: {
          id: true,
          name: true,
          policies: {
            id: true,
            name: true,
            permissions: {
              id: true,
              resource: true,
              action: true,
            },
          },
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
    const account = this.accountRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!account) throw new BadRequestException('Account not found');
    return account;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        roles: true,
      },
    });

    if (!account) throw new BadRequestException('Account not found');

    if (updateAccountDto?.roleId?.length > 0) {
      const roles = await this.roleService.findAllOtherService({
        where: {
          id: In(updateAccountDto.roleId),
        },
      });
      account.roles = roles;
    }

    return this.accountRepository.save(account);
  }

  remove(id: string): Promise<DeleteResult> {
    return this.accountRepository.delete({
      id,
    });
  }

  findByUsername(username: string): Promise<{
    id: string;
    username: string;
    password?: string;
  }> {
    return this.accountRepository.findOne({
      where: {
        username: username,
      },
      relations: {
        roles: {
          policies: {
            permissions: true,
          },
        },
      },
      select: {
        id: true,
        username: true,
        password: true,
        roles: {
          id: true,
          name: true,
          policies: {
            id: true,
            name: true,
            permissions: {
              id: true,
              resource: true,
              action: true,
            },
          },
        },
      },
    });
  }
}
