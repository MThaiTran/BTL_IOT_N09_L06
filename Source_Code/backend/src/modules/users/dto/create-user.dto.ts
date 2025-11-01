import { UserRole } from 'src/common/enum/enum';

export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly hashPassword: string;
  readonly roleId?: UserRole | number;
}
