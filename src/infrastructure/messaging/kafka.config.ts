import { Kafka, KafkaConfig, Producer, ProducerConfig } from 'kafkajs';
import { Logger } from '../../shared/logging/logger';

export class KafkaConfigManager {
  private static instance: KafkaConfigManager;
  private kafka: Kafka;
  private producer: Producer;

  private constructor() {
    const kafkaConfig: KafkaConfig = {
      clientId: process.env.KAFKA_CLIENT_ID || 'driver-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      retry: {
        retries: 8,
        initialRetryTime: 100,
        multiplier: 2,
        maxRetryTime: 30000,
      },
    };

    const producerConfig: ProducerConfig = {
      allowAutoTopicCreation: true,
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer(producerConfig);
  }

  public static getInstance(): KafkaConfigManager {
    if (!KafkaConfigManager.instance) {
      KafkaConfigManager.instance = new KafkaConfigManager();
    }
    return KafkaConfigManager.instance;
  }

  public getProducer(): Producer {
    return this.producer;
  }

  public async connect(): Promise<void> {
    try {
      await this.producer.connect();
      Logger.info('Kafka Producer connected successfully');
    } catch (error) {
      Logger.error('Failed to connect Kafka Producer', undefined, { error: String(error) });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      Logger.info('Kafka Producer disconnected successfully');
    } catch (error) {
      Logger.error('Failed to disconnect Kafka Producer', undefined, { error: String(error) });
      throw error;
    }
  }
}

