export interface DriverEvent {
  eventType: 'driver.registered' | 'driver.status.changed' | 'driver.updated' | 'driver.deleted';
  driverId: string;
  timestamp: string;
  data: {
    id: string;
    name: string;
    vehicle?: string;
    plate?: string;
    isActive?: boolean;
    vehicleType?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleColor?: string;
    vehicleCapacity?: number;
    [key: string]: any;
  };
}

export interface EventPublisherPort {
  publish(topic: string, event: DriverEvent, partition?: number): Promise<void>;
  publishBatch(events: Array<{ topic: string; event: DriverEvent; partition?: number }>): Promise<void>;
}

