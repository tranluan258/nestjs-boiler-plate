import { ACTION } from './../permission/enum/action.enum';
import { RESOURCE } from './../permission/enum/resource.enum';
import { RequirePermission } from '../auth/decorator/permission.decorator';
import { PermissionGuard } from './../auth/guard/permission.guard';
import { BaseQueryParameter } from './../shared/base-query-parameter';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guard/jwt.guard';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @RequirePermission({ action: ACTION.CREATE, resource: RESOURCE.ACCOUNT })
  async create(@Body() createAccountDto: CreateAccountDto) {
    await this.accountService.create(createAccountDto);
    return {
      message: 'Account created successfully',
    };
  }

  @Get()
  @RequirePermission({ action: ACTION.READ, resource: RESOURCE.ACCOUNT })
  findAll(@Query() query: BaseQueryParameter) {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
