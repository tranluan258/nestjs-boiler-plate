import { ACTION } from './../permission/enum/action.enum';
import { RESOURCE } from './../permission/enum/resource.enum';
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
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionGuard, RequirePermission } from '@app/auth';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @RequirePermission({ action: ACTION.CREATE, resource: RESOURCE.ACCOUNT })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'Account created successfully',
        },
      },
    },
  })
  async create(@Body() createAccountDto: CreateAccountDto) {
    await this.accountService.create(createAccountDto);
    return {
      message: 'Account created successfully',
    };
  }

  @Get()
  @RequirePermission({ action: ACTION.READ, resource: RESOURCE.ACCOUNT })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all account',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        total: {
          type: 'number',
          default: 0,
        },
      },
    },
  })
  findAll(@Query() query: BaseQueryParameter) {
    return this.accountService.findAll(query);
  }

  @Get(':id')
  @RequirePermission({ action: ACTION.READ, resource: RESOURCE.ACCOUNT })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get account by id',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        username: {
          type: 'string',
        },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              policies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                    permissions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                          },
                          resource: {
                            type: 'string',
                          },
                          action: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ action: ACTION.UPDATE, resource: RESOURCE.ACCOUNT })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'Account updated successfully',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    await this.accountService.update(id, updateAccountDto);
    return {
      message: 'Account updated successfully',
    };
  }

  @Delete(':id')
  @RequirePermission({ action: ACTION.DELETE, resource: RESOURCE.ACCOUNT })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          default: 'Account deleted successfully',
        },
      },
    },
  })
  async remove(@Param('id') id: string) {
    await this.accountService.remove(id);
    return {
      message: 'Account deleted successfully',
    };
  }
}
