import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { DriverActivity, DriverActivityAction } from '../../../domain/driver/driver-activity.entity';
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error';
import { EventPublisherPort } from '../../../domain/messaging/event-publisher.port';
import { DriverEventFactory } from '../../../infrastructure/messaging/driver-event-factory';
import { KafkaTopics, TOPIC_CONFIGS, getPartitionForDriver } from '../../../infrastructure/messaging/kafka-topics.config';
import { Logger } from '../../../shared/logging/logger';

export class UpdateDriverUseCase {
  constructor(
    private repo: DriverRepositoryPort,
    private activityRepo?: DriverActivityRepositoryPort,
    private eventPublisher?: EventPublisherPort
  ) {}

  async execute(id: string, input: {
    name?: string;
    vehicle?: string;
    plate?: string;
    vehicleType?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleColor?: string;
    vehicleCapacity?: number;
  }) {
    if (!id) {
      throw new NotFoundError('Driver');
    }

    const driver = await this.repo.findById(id);
    if (!driver) {
      throw new NotFoundError('Driver');
    }

    // Validate plate uniqueness if provided
    if (input.plate && input.plate !== driver.plate) {
      const existingDriver = await this.repo.findByPlate(input.plate);
      if (existingDriver && existingDriver.id !== id) {
        throw new ValidationError('Plate number already exists');
      }
    }

    // Track if vehicle info was updated
    const vehicleUpdated =
      input.vehicleType !== undefined ||
      input.vehicleModel !== undefined ||
      input.vehicleYear !== undefined ||
      input.vehicleColor !== undefined ||
      input.vehicleCapacity !== undefined;

    // Track if profile was updated
    const profileUpdated =
      input.name !== undefined ||
      input.vehicle !== undefined ||
      input.plate !== undefined;

    // Update driver fields
    if (input.name !== undefined) driver.name = input.name;
    if (input.vehicle !== undefined) driver.vehicle = input.vehicle;
    if (input.plate !== undefined) driver.plate = input.plate;
    if (vehicleUpdated) {
      driver.updateVehicleInfo(
        input.vehicleType,
        input.vehicleModel,
        input.vehicleYear,
        input.vehicleColor,
        input.vehicleCapacity
      );
    }
    driver.updatedAt = new Date();

    const savedDriver = await this.repo.save(driver);

    // Log activity
    if (this.activityRepo) {
      if (vehicleUpdated) {
        const vehicleActivity = DriverActivity.create(
          savedDriver.id,
          DriverActivityAction.VEHICLE_UPDATED,
          null,
          null,
          { vehicleType: input.vehicleType, vehicleModel: input.vehicleModel, vehicleYear: input.vehicleYear, vehicleColor: input.vehicleColor, vehicleCapacity: input.vehicleCapacity }
        );
        await this.activityRepo.save(vehicleActivity);
      }
      if (profileUpdated) {
        const profileActivity = DriverActivity.create(
          savedDriver.id,
          DriverActivityAction.PROFILE_UPDATED,
          null,
          null,
          { name: input.name, vehicle: input.vehicle, plate: input.plate }
        );
        await this.activityRepo.save(profileActivity);
      }
    }

    // Publish event to Kafka
    if (this.eventPublisher && (vehicleUpdated || profileUpdated)) {
      try {
        const changes = { ...input };
        const event = DriverEventFactory.createDriverUpdatedEvent(savedDriver, changes);
        const eventsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_EVENTS];
        const partition = getPartitionForDriver(savedDriver.id, eventsTopicConfig.partitions || 3);
        
        await this.eventPublisher.publish(eventsTopicConfig.topic, event, partition);
      } catch (error) {
        Logger.error('Failed to publish driver updated event', undefined, { error: String(error), driverId: id });
        // Don't throw - event publishing failure shouldn't break the use case
      }
    }

    return savedDriver;
  }
}

