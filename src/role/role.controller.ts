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
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: BaseQueryParameter) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    await this.roleService.update(id, updateRoleDto);
    return {
      message: 'Role updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return {
      message: 'Role deleted successfully',
    };
  }
}
