import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { Driver, DriverCreateProps } from '../../../domain/driver/driver.entity';
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
    driver_id: string;
    name: string;
    phone: string;
    vehicle_type: string;
    vehicle_plate: string;
    is_active?: boolean;
    vehicle_model?: string;
    vehicle_year?: number;
    vehicle_color?: string;
    vehicle_capacity?: number;
  }) {
    if (!input.driver_id || !input.name || !input.phone || !input.vehicle_type || !input.vehicle_plate) {
      throw new ValidationError('driver_id, name, phone, vehicle_type, vehicle_plate are required');
    }

    const existingById = await this.repo.findById(input.driver_id);
    if (existingById) {
      throw new ConflictError('driver_id already exists');
    }

    const existingDriver = await this.repo.findByPlate(input.vehicle_plate);
    if (existingDriver) {
      throw new ConflictError('vehicle_plate already exists');
    }

    const driver = Driver.create({
      driverId: input.driver_id,
      name: input.name,
      phone: input.phone,
      vehicleType: input.vehicle_type,
      vehiclePlate: input.vehicle_plate,
      isActive: input.is_active,
      vehicleModel: input.vehicle_model,
      vehicleYear: input.vehicle_year,
      vehicleColor: input.vehicle_color,
      vehicleCapacity: input.vehicle_capacity,
    });
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
