import { Role } from '../../role/entities/role.entity';
export interface JwtPayload {
  id: string;
  username: string;
  roles: Role[];
}
