import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}
  async create(createAccountDto: CreateAccountDto) {
    const isExistingAccount = await this.accountRepository.findOne({
      where: {
        username: createAccountDto.username,
      },
    });

    if (isExistingAccount)
      throw new BadRequestException('Account already exists');

    const account = this.accountRepository.create(createAccountDto);
    const hashPassword = bcrypt.hashSync(account.password, 10);
    account.password = hashPassword;
    return this.accountRepository.save(account);
  }

  findAll() {
    return this.accountRepository.find({
      relations: {
        roles: true,
      },
      order: {
        roles: {
          name: {
            direction: 'ASC',
            nulls: 'LAST',
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  findByUsername(username: string) {
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
