import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryParameter {
  @ApiPropertyOptional({
    description: 'Offset of items to return',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: 'Limit of items to return',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Sort by',
  })
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @IsString()
  @IsOptional()
  order: string;
}
