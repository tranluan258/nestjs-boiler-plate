import { Policy } from '@/policy/entities/policy.entity';
import { BaseEntity } from '@/shared/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  resource: string;

  @Column({ type: 'varchar', nullable: false })
  action: string;

  @ManyToMany(() => Policy, (policy) => policy.permissions)
  policies: Policy[];
}
