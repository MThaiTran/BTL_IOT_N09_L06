import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/extendable.services';
import { UserDevice } from './entities/user-device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseRepository } from 'src/base/base.repository';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { UpdateUserDeviceDto } from './dto/update-user-device.dto';

export class UserDevicesService {
  constructor(
    @InjectRepository(UserDevice)
    private userDeviceRepository: Repository<UserDevice>,
  ) {}

  async create(createUserDeviceDto: CreateUserDeviceDto) {
    const newUserDevice = this.userDeviceRepository.create(
      createUserDeviceDto as DeepPartial<UserDevice>,
    );
    return this.userDeviceRepository.save(newUserDevice);
  }

  async getUserDevicesByUserId(
    userId: number,
    context: string,
  ): Promise<UserDevice[] | UserDevice | String> {
    const userDevices = await this.userDeviceRepository.find({
      where: { userId },
      relations: ['device'],
    });

    if (context == null || context === undefined || context === '')
      return userDevices;

    const filterdPermissions = userDevices.filter(
      (rp) => rp.device.name === context,
    );

    if (filterdPermissions.length > 1) return 'Duplicated permissions found';
    if (filterdPermissions.length == 0) return 'No permissions found';
    return filterdPermissions[0];
  }

  async getUserDeviceByIdPair(userId: number, deviceId: number) {
    return this.userDeviceRepository.findOne({
      where: { userId, deviceId },
      relations: ['device'],
    });
  }

  async updateByIdPair(
    userId: number,
    deviceId: number,
    updateUserDeviceDto: UpdateUserDeviceDto,
  ) {
    await this.userDeviceRepository.update(
      { userId, deviceId },
      updateUserDeviceDto as DeepPartial<UserDevice>,
    );
    return this.getUserDeviceByIdPair(userId, deviceId);
  }

  async removeByIdPair(userId: number, deviceId: number) {
    await this.userDeviceRepository.delete({ userId, deviceId });
  }
}
