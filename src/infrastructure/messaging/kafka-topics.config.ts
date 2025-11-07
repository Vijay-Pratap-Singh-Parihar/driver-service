/**
 * Kafka Topics Configuration
 * Centralized configuration for all Kafka topics used by driver-service
 */

export enum KafkaTopics {
  DRIVER_EVENTS = 'driver-events',
  DRIVER_NOTIFICATIONS = 'driver-notifications',
}

export interface TopicConfig {
  topic: string;
  partitions?: number;
  replicationFactor?: number;
}

export const TOPIC_CONFIGS: Record<KafkaTopics, TopicConfig> = {
  [KafkaTopics.DRIVER_EVENTS]: {
    topic: process.env.KAFKA_TOPIC_DRIVER_EVENTS || 'driver-events',
    partitions: parseInt(process.env.KAFKA_DRIVER_EVENTS_PARTITIONS || '3', 10),
    replicationFactor: parseInt(process.env.KAFKA_DRIVER_EVENTS_REPLICATION || '1', 10),
  },
  [KafkaTopics.DRIVER_NOTIFICATIONS]: {
    topic: process.env.KAFKA_TOPIC_DRIVER_NOTIFICATIONS || 'driver-notifications',
    partitions: parseInt(process.env.KAFKA_DRIVER_NOTIFICATIONS_PARTITIONS || '3', 10),
    replicationFactor: parseInt(process.env.KAFKA_DRIVER_NOTIFICATIONS_REPLICATION || '1', 10),
  },
};

/**
 * Get partition number for a given driver ID
 * Uses consistent hashing to ensure same driver always goes to same partition
 */
export function getPartitionForDriver(driverId: string, totalPartitions: number): number {
  // Simple hash function for consistent partitioning
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = ((hash << 5) - hash + driverId.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % totalPartitions;
}

