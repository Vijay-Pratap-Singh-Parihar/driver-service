import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { NotFoundError } from '../../../shared/errors/app-error';
import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';

export class GetDriverActivityUseCase {
  constructor(
    private activityRepo: DriverActivityRepositoryPort,
    private driverRepo: DriverRepositoryPort
  ) {}

  async execute(driverId: string) {
    if (!driverId) {
      throw new NotFoundError('Driver');
    }

    // Verify driver exists
    const driver = await this.driverRepo.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Driver');
    }

    // Get activity history
    const activities = await this.activityRepo.findByDriverId(driverId);
    return activities;
  }
}

