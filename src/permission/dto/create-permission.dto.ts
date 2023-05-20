import { RESOURCE } from './../enum/resource.enum';
import { ACTION } from './../enum/action.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    type: 'enum',
    enum: [
      RESOURCE.ACCOUNT,
      RESOURCE.ROLE,
      RESOURCE.PERMISSION,
      RESOURCE.POLICY,
    ],
  })
  @IsEnum(RESOURCE, {
    message: `resource must be one of the following values: ${RESOURCE.ACCOUNT}, ${RESOURCE.ROLE}, ${RESOURCE.PERMISSION}, ${RESOURCE.POLICY}`,
  })
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    type: 'enum',
    enum: [ACTION.CREATE, ACTION.READ, ACTION.UPDATE, ACTION.DELETE],
  })
  @IsEnum(ACTION, {
    message: `action must be one of the following values: ${ACTION.CREATE}, ${ACTION.READ}, ${ACTION.UPDATE}, ${ACTION.DELETE}`,
  })
  @IsNotEmpty()
  action: string;
}
