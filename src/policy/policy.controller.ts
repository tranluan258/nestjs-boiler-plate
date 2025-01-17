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
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { ApiTags } from '@nestjs/swagger';
import { Policy } from './entities/policy.entity';
import { BaseResponseForPaging } from '@/shared/response-for-paging';

@ApiTags('Policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto): Promise<Policy> {
    return this.policyService.create(createPolicyDto);
  }

  @Get()
  findAll(
    @Query() query: BaseQueryParameter,
  ): Promise<BaseResponseForPaging<Policy>> {
    return this.policyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Policy> {
    return this.policyService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ): Promise<{ message: string }> {
    await this.policyService.update(id, updatePolicyDto);
    return {
      message: 'Update policy successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.policyService.remove(id);
    return {
      message: 'Policy deleted successfully',
    };
  }
}
