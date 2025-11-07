import { EventPublisherPort, DriverEvent } from '../../domain/messaging/event-publisher.port';
import { KafkaConfigManager } from './kafka.config';
import { Producer } from 'kafkajs';
import { Logger } from '../../shared/logging/logger';

export class KafkaEventPublisher implements EventPublisherPort {
  private producer: Producer;

  constructor() {
    const kafkaConfig = KafkaConfigManager.getInstance();
    this.producer = kafkaConfig.getProducer();
  }

  async publish(topic: string, event: DriverEvent, partition?: number): Promise<void> {
    try {
      const message = {
        topic,
        messages: [
          {
            key: event.driverId, // Use driverId as key for partitioning by driver
            value: JSON.stringify(event),
            partition, // Optional partition number
          },
        ],
      };

      await this.producer.send(message);
      Logger.info('Published event', undefined, {
        eventType: event.eventType,
        topic,
        partition,
        driverId: event.driverId,
      });
    } catch (error) {
      Logger.error('Failed to publish event', undefined, {
        eventType: event.eventType,
        topic,
        error: String(error),
      });
      throw error;
    }
  }

  async publishBatch(events: Array<{ topic: string; event: DriverEvent; partition?: number }>): Promise<void> {
    try {
      const messagesByTopic = events.reduce((acc, { topic, event, partition }) => {
        if (!acc[topic]) {
          acc[topic] = [];
        }
        acc[topic].push({
          key: event.driverId,
          value: JSON.stringify(event),
          partition,
        });
        return acc;
      }, {} as Record<string, Array<{ key: string; value: string; partition?: number }>>);

      const sendPromises = Object.entries(messagesByTopic).map(([topic, messages]) =>
        this.producer.send({
          topic,
          messages,
        })
      );

      await Promise.all(sendPromises);
      Logger.info('Published batch events', undefined, {
        eventCount: events.length,
        topicCount: Object.keys(messagesByTopic).length,
      });
    } catch (error) {
      Logger.error('Failed to publish batch events', undefined, { error: String(error) });
      throw error;
    }
  }
}

