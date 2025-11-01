import { Injectable } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { BaseService } from 'src/base/extendable.services';
import { RolePermission } from './entities/role-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base/base.repository';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    const newRolePermission = this.rolePermissionRepository.create(
      createRolePermissionDto as DeepPartial<RolePermission>,
    );
    return this.rolePermissionRepository.save(newRolePermission);
  }

  async getRolePermissionsByRoleId(
    roleId: number,
    context: string,
  ): Promise<RolePermission[] | RolePermission | String> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    if (context == null || context === undefined || context === '')
      return rolePermissions;

    const filterdPermissions = rolePermissions.filter(
      (rp) => rp.permission.name === context,
    );

    if (filterdPermissions.length > 1) return 'Duplicated permissions found';
    if (filterdPermissions.length == 0) return 'No permissions found';
    return filterdPermissions[0];
  }

  async getRolePermissionByIdPair(roleId: number, permissionId: number) {
    return this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
      relations: ['permission'],
    });
  }

  async updateByIdPair(
    roleId: number,
    permissionId: number,
    updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    await this.rolePermissionRepository.update(
      { roleId, permissionId },
      updateRolePermissionDto as DeepPartial<RolePermission>,
    );
    return this.getRolePermissionByIdPair(roleId, permissionId);
  }

  async removeByIdPair(roleId: number, permissionId: number) {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }
}
