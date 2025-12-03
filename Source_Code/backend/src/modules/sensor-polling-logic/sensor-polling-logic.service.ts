// import { CreateSensorPollingLogicDto } from './dto/create-sensor-polling-logic.dto';
// import { UpdateSensorPollingLogicDto } from './dto/update-sensor-polling-logic.dto';

// import {
//   Injectable,
//   Logger,
//   OnModuleInit,
//   OnModuleDestroy,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as admin from 'firebase-admin';
// import { Device } from '../device/device.entity';
// import { SystemLog } from '../system-log/system-log.entity';

// @Injectable()
// export class SensorPollingService implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(SensorPollingService.name);
//   private pollingInterval: NodeJS.Timeout;
//   private deviceStates = new Map<number, { init: number; lastSave: number }>();

//   private readonly POLL_MS = 5000; // every 5 seconds
//   private readonly PERIOD_MS = 20 * 60 * 1000; // 20 minutes

//   constructor(
//     @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
//     @InjectRepository(SystemLog)
//     private readonly logRepo: Repository<SystemLog>,
//   ) {}

//   async onModuleInit() {
//     // Initialize Firebase Admin SDK
//     if (!admin.apps.length) {
//       admin.initializeApp({
//         credential: admin.credential.cert(
//           require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
//         ),
//         databaseURL: process.env.FIREBASE_DB_URL,
//       });
//     }

//     this.logger.log('✅ Sensor polling started...');
//     this.pollingInterval = setInterval(() => this.pollDevices(), this.POLL_MS);
//   }

//   onModuleDestroy() {
//     if (this.pollingInterval) clearInterval(this.pollingInterval);
//   }

//   private async pollDevices() {
//     const devices = await this.deviceRepo.find();
//     const db = admin.database();

//     for (const device of devices) {
//       try {
//         const snap = await db.ref(device.firebasePath).get();
//         const val = Number(snap.val());
//         if (isNaN(val)) continue;
//         await this.handleValue(device, val);
//       } catch (err) {
//         this.logger.warn(`⚠️ Failed to poll ${device.name}: ${err.message}`);
//       }
//     }
//   }

//   private async handleValue(device: Device, value: number) {
//     const now = Date.now();
//     const delta = device.deltaRange ?? 3;
//     const s = this.deviceStates.get(device.id) || { init: value, lastSave: 0 };
//     const diff = Math.abs(value - s.init);

//     // 1️⃣ Threshold alert
//     if (
//       (device.thresholdLow && value < device.thresholdLow) ||
//       (device.thresholdHigh && value > device.thresholdHigh)
//     ) {
//       await this.saveLog(device, 'ALERT_TRIGGERED', { value });
//       this.deviceStates.set(device.id, { init: value, lastSave: now });
//       return;
//     }

//     // 2️⃣ Significant change
//     if (diff > delta) {
//       await this.saveLog(device, 'SIGNIFICANT_CHANGE', {
//         old: s.init,
//         new: value,
//       });
//       this.deviceStates.set(device.id, { init: value, lastSave: now });
//       return;
//     }

//     // 3️⃣ Periodic snapshot
//     if (now - s.lastSave >= this.PERIOD_MS) {
//       await this.saveLog(device, 'PERIODIC_SNAPSHOT', { value });
//       this.deviceStates.set(device.id, { init: value, lastSave: now });
//     }
//   }

//   private async saveLog(device: Device, type: string, data: any) {
//     await this.logRepo.save(
//       this.logRepo.create({
//         deviceId: device.id,
//         log: type,
//         logDescription: `${type} for ${device.name}`,
//         logData: data,
//       }),
//     );
//     this.logger.log(
//       `💾 ${type} logged for ${device.name}: ${JSON.stringify(data)}`,
//     );
//   }
// }
