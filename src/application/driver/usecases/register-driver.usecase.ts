import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { Driver } from '../../../domain/driver/driver.entity';
import { DriverActivity, DriverActivityAction } from '../../../domain/driver/driver-activity.entity';
import { ValidationError, ConflictError } from '../../../shared/errors/app-error';
import { EventPublisherPort } from '../../../domain/messaging/event-publisher.port';
import { DriverEventFactory } from '../../../infrastructure/messaging/driver-event-factory';
import { KafkaTopics, TOPIC_CONFIGS, getPartitionForDriver } from '../../../infrastructure/messaging/kafka-topics.config';
import { inc, METRIC_DRIVER_REGISTRATIONS_TOTAL } from '../../../infrastructure/metrics/metrics';
import { Logger } from '../../../shared/logging/logger';

export class RegisterDriverUseCase {
  constructor(
    private repo: DriverRepositoryPort,
    private activityRepo?: DriverActivityRepositoryPort,
    private eventPublisher?: EventPublisherPort
  ) {}

  async execute(input: {
    id: string;
    name: string;
    vehicle: string;
    plate: string;
    vehicleType?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleColor?: string;
    vehicleCapacity?: number;
  }) {
    if (!input.id || !input.name || !input.vehicle || !input.plate) {
      throw new ValidationError('id, name, vehicle, plate are required');
    }

    // Check if plate already exists
    const existingDriver = await this.repo.findByPlate(input.plate);
    if (existingDriver) {
      throw new ConflictError('Plate number already exists');
    }

    const driver = Driver.create(
      input.id,
      input.name,
      input.vehicle,
      input.plate,
      input.vehicleType,
      input.vehicleModel,
      input.vehicleYear,
      input.vehicleColor,
      input.vehicleCapacity
    );
    const savedDriver = await this.repo.save(driver);
    inc(METRIC_DRIVER_REGISTRATIONS_TOTAL, 1);

    // Log activity
    if (this.activityRepo) {
      const activity = DriverActivity.create(savedDriver.id, DriverActivityAction.CREATED);
      await this.activityRepo.save(activity);
    }

    // Publish event to Kafka
    if (this.eventPublisher) {
      try {
        const event = DriverEventFactory.createDriverRegisteredEvent(savedDriver);
        const eventsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_EVENTS];
        const notificationsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_NOTIFICATIONS];
        const partition = getPartitionForDriver(savedDriver.id, eventsTopicConfig.partitions || 3);
        
        await this.eventPublisher.publish(eventsTopicConfig.topic, event, partition);
        await this.eventPublisher.publish(notificationsTopicConfig.topic, event, partition);
      } catch (error) {
        Logger.error('Failed to publish driver registered event', undefined, { error: String(error) });
        // Don't throw - event publishing failure shouldn't break the use case
      }
    }

    return savedDriver;
  }
}
