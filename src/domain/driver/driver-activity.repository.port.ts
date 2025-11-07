import { DriverActivity } from './driver-activity.entity';

export interface DriverActivityRepositoryPort {
  save(activity: DriverActivity): Promise<DriverActivity>;
  findByDriverId(driverId: string): Promise<DriverActivity[]>;
  findByDriverIdAndAction(driverId: string, action: string): Promise<DriverActivity[]>;
}

