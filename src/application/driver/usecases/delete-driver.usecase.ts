import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { DriverActivity, DriverActivityAction } from '../../../domain/driver/driver-activity.entity';
import { NotFoundError } from '../../../shared/errors/app-error';
import { EventPublisherPort } from '../../../domain/messaging/event-publisher.port';
import { DriverEventFactory } from '../../../infrastructure/messaging/driver-event-factory';
import { KafkaTopics, TOPIC_CONFIGS, getPartitionForDriver } from '../../../infrastructure/messaging/kafka-topics.config';
import { Logger } from '../../../shared/logging/logger';

export class DeleteDriverUseCase {
  constructor(
    private repo: DriverRepositoryPort,
    private activityRepo?: DriverActivityRepositoryPort,
    private eventPublisher?: EventPublisherPort
  ) {}

  async execute(id: string) {
    if (!id) {
      throw new NotFoundError('Driver');
    }

    const driver = await this.repo.findById(id);
    if (!driver) {
      throw new NotFoundError('Driver');
    }

    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Driver');
    }

    // Log activity
    if (this.activityRepo) {
      const activity = DriverActivity.create(
        driver.id,
        DriverActivityAction.DELETED,
        null,
        null,
        { driverName: driver.name, plate: driver.plate }
      );
      await this.activityRepo.save(activity);
    }

    // Publish event to Kafka
    if (this.eventPublisher) {
      try {
        const event = DriverEventFactory.createDriverDeletedEvent(driver.id, driver.name, driver.plate);
        const eventsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_EVENTS];
        const notificationsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_NOTIFICATIONS];
        const partition = getPartitionForDriver(driver.id, eventsTopicConfig.partitions || 3);
        
        await this.eventPublisher.publish(eventsTopicConfig.topic, event, partition);
        await this.eventPublisher.publish(notificationsTopicConfig.topic, event, partition);
      } catch (error) {
        Logger.error('Failed to publish driver deleted event', undefined, { error: String(error), driverId: id });
        // Don't throw - event publishing failure shouldn't break the use case
      }
    }

    return { success: true, message: 'Driver deleted successfully' };
  }
}

