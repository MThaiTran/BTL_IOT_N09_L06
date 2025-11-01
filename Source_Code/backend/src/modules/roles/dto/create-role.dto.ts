import { ERole, Status } from 'src/common/enum/enum';

export class CreateRoleDto {
  readonly name: ERole;
  readonly description: string;
  readonly status?: Status;
}
