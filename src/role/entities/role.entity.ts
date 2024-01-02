import { Account } from '@/account/entities/account.entity';
import { Policy } from '@/policy/entities/policy.entity';
import { BaseEntity } from '@/shared/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 40, nullable: false, unique: true })
  name: string;

  @ManyToMany(() => Policy, (policy) => policy.roles)
  @JoinTable({
    name: 'role_policy',
  })
  policies: Policy[];

  @ManyToMany(() => Account, (account) => account.roles)
  accounts: Account[];
}
