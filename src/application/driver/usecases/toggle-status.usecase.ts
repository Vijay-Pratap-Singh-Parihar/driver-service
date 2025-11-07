import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { DriverActivityRepositoryPort } from '../../../domain/driver/driver-activity.repository.port';
import { DriverActivity, DriverActivityAction } from '../../../domain/driver/driver-activity.entity';
import { NotFoundError, ValidationError } from '../../../shared/errors/app-error';
import { EventPublisherPort } from '../../../domain/messaging/event-publisher.port';
import { DriverEventFactory } from '../../../infrastructure/messaging/driver-event-factory';
import { KafkaTopics, TOPIC_CONFIGS, getPartitionForDriver } from '../../../infrastructure/messaging/kafka-topics.config';
import { inc, METRIC_DRIVER_STATUS_CHANGES_TOTAL } from '../../../infrastructure/metrics/metrics';
import { Logger } from '../../../shared/logging/logger';

export class ToggleDriverStatusUseCase {
  constructor(
    private repo: DriverRepositoryPort,
    private activityRepo?: DriverActivityRepositoryPort,
    private eventPublisher?: EventPublisherPort
  ) {}

  async execute(id: string, isActive: boolean) {
    if (typeof isActive !== 'boolean') {
      throw new ValidationError('isActive must be boolean');
    }
    const driver = await this.repo.findById(id);
    if (!driver) throw new NotFoundError('Driver');

    const oldStatus = driver.isActive;
    driver.setStatus(isActive);
    const savedDriver = await this.repo.save(driver);
    if (oldStatus !== isActive) {
      inc(METRIC_DRIVER_STATUS_CHANGES_TOTAL, 1);
    }

    // Log activity
    if (this.activityRepo && oldStatus !== isActive) {
      const activity = DriverActivity.create(
        savedDriver.id,
        DriverActivityAction.STATUS_CHANGED,
        String(oldStatus),
        String(isActive)
      );
      await this.activityRepo.save(activity);
    }

    // Publish event to Kafka
    if (this.eventPublisher && oldStatus !== isActive) {
      try {
        const event = DriverEventFactory.createDriverStatusChangedEvent(savedDriver, oldStatus);
        const eventsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_EVENTS];
        const notificationsTopicConfig = TOPIC_CONFIGS[KafkaTopics.DRIVER_NOTIFICATIONS];
        const partition = getPartitionForDriver(savedDriver.id, eventsTopicConfig.partitions || 3);
        
        await this.eventPublisher.publish(eventsTopicConfig.topic, event, partition);
        await this.eventPublisher.publish(notificationsTopicConfig.topic, event, partition);
      } catch (error) {
        Logger.error('Failed to publish driver status changed event', undefined, { error: String(error) });
        // Don't throw - event publishing failure shouldn't break the use case
      }
    }

    return savedDriver;
  }
}
