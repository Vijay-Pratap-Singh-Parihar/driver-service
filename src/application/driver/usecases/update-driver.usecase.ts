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
    phone?: string;
    vehicle_type?: string;
    vehicle_plate?: string;
    is_active?: boolean;
    vehicle_model?: string;
    vehicle_year?: number;
    vehicle_color?: string;
    vehicle_capacity?: number;
  }) {
    if (!id) {
      throw new NotFoundError('Driver');
    }

    const driver = await this.repo.findById(id);
    if (!driver) {
      throw new NotFoundError('Driver');
    }

    // Validate plate uniqueness if provided
    if (input.vehicle_plate && input.vehicle_plate !== driver.vehiclePlate) {
      const existingDriver = await this.repo.findByPlate(input.vehicle_plate);
      if (existingDriver && existingDriver.id !== id) {
        throw new ValidationError('vehicle_plate already exists');
      }
    }

    const previousStatus = driver.isActive;

    // Track updates
    const profileUpdated =
      input.name !== undefined ||
      input.phone !== undefined ||
      input.vehicle_type !== undefined ||
      input.vehicle_plate !== undefined;

    const vehicleDetailsUpdated =
      input.vehicle_model !== undefined ||
      input.vehicle_year !== undefined ||
      input.vehicle_color !== undefined ||
      input.vehicle_capacity !== undefined;

    const statusUpdated = input.is_active !== undefined && input.is_active !== previousStatus;

    // Update driver fields
    if (input.name !== undefined) driver.name = input.name;
    if (input.phone !== undefined) driver.phone = input.phone;
    if (input.vehicle_type !== undefined) driver.vehicleType = input.vehicle_type;
    if (input.vehicle_plate !== undefined) driver.vehiclePlate = input.vehicle_plate;
    if (vehicleDetailsUpdated) {
      driver.updateVehicleInfo(
        input.vehicle_model,
        input.vehicle_year,
        input.vehicle_color,
        input.vehicle_capacity
      );
    }
    if (input.is_active !== undefined) {
      driver.setStatus(input.is_active);
    }
    driver.updatedAt = new Date();

    const savedDriver = await this.repo.save(driver);

    // Log activity
    if (this.activityRepo) {
      if (vehicleDetailsUpdated) {
        const vehicleActivity = DriverActivity.create(
          savedDriver.id,
          DriverActivityAction.VEHICLE_UPDATED,
          null,
          null,
          {
            vehicle_model: input.vehicle_model,
            vehicle_year: input.vehicle_year,
            vehicle_color: input.vehicle_color,
            vehicle_capacity: input.vehicle_capacity,
          }
        );
        await this.activityRepo.save(vehicleActivity);
      }
      if (profileUpdated) {
        const profileActivity = DriverActivity.create(
          savedDriver.id,
          DriverActivityAction.PROFILE_UPDATED,
          null,
          null,
          {
            name: input.name,
            phone: input.phone,
            vehicle_type: input.vehicle_type,
            vehicle_plate: input.vehicle_plate,
          }
        );
        await this.activityRepo.save(profileActivity);
      }
      if (statusUpdated) {
        const statusActivity = DriverActivity.create(
          savedDriver.id,
          DriverActivityAction.STATUS_CHANGED,
          String(previousStatus),
          String(input.is_active),
          { updated_via: 'profile_update', vehicle_plate: savedDriver.vehiclePlate }
        );
        await this.activityRepo.save(statusActivity);
      }
    }

    // Publish event to Kafka
    if (this.eventPublisher && (vehicleDetailsUpdated || profileUpdated || statusUpdated)) {
      try {
        const changes: Record<string, any> = {};
        if (input.name !== undefined) changes.name = input.name;
        if (input.phone !== undefined) changes.phone = input.phone;
        if (input.vehicle_type !== undefined) changes.vehicle_type = input.vehicle_type;
        if (input.vehicle_plate !== undefined) changes.vehicle_plate = input.vehicle_plate;
        if (input.vehicle_model !== undefined) changes.vehicle_model = input.vehicle_model;
        if (input.vehicle_year !== undefined) changes.vehicle_year = input.vehicle_year;
        if (input.vehicle_color !== undefined) changes.vehicle_color = input.vehicle_color;
        if (input.vehicle_capacity !== undefined) changes.vehicle_capacity = input.vehicle_capacity;
        if (statusUpdated) changes.is_active = input.is_active;
        const event = DriverEventFactory.createDriverUpdatedEvent(savedDriver, changes);
        const eventsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_EVENTS];
        const notificationsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_NOTIFICATIONS];
        const partition = getPartitionForDriver(savedDriver.id, eventsTopicConfig.partitions || 3);
        
        await this.eventPublisher.publish(eventsTopicConfig.topic, event, partition);
        await this.eventPublisher.publish(notificationsTopicConfig.topic, event, partition);
      } catch (error) {
        Logger.error('Failed to publish driver updated event', undefined, { error: String(error), driverId: id });
        // Don't throw - event publishing failure shouldn't break the use case
      }
    }

    return savedDriver;
  }
}

