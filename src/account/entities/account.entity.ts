import { Role } from './../../role/entities/role.entity';
import { BaseEntity } from './../../shared/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Account extends BaseEntity {
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ManyToMany(() => Role, (role) => role.accounts)
  @JoinTable({
    name: 'account_role',
  })
  roles: Role[];
}
