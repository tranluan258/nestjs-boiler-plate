import { BaseEntity } from './../../shared/base.entity';
import { Role } from './../../role/entities/role.entity';
import { Permission } from './../../permission/entities/permission.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Policy extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.policies)
  @JoinTable({
    name: 'policy_permission',
  })
  permissions: Permission[];

  @ManyToMany(() => Role, (role) => role.policies)
  roles: Role[];
}
