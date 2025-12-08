import { Status } from 'src/common/enum/enum';

export interface MqttLogsTopicDto {
  sensors: SensorDataDto;
  devices: DeviceDataDto[];
}

export interface SensorDataDto {
  temp: number;
  hum: number;
  motion: boolean;
}

export interface DeviceDataDto {
  id: number;
  state: boolean;
  autoMode: boolean;
  status: Status;
}

export interface MqttWarningsTopicDto {
  id: number;
  threshold:
    | 'tempLower'
    | 'tempHigher'
    | 'humLower'
    | 'humHigher'
    | 'motionOn'
    | 'motionOff';
  thresholdValue: number;
  value: number;
}

export interface MqttDeviceTopicDto {
  id: number;
  state?: boolean;
  autoMode?: boolean;
  status?: Status;
  tempHigher?: number;
  tempLower?: number;
  humHigher?: number;
  humLower?: number;
  motionOn?: boolean;
  motionOff?: boolean;
}
