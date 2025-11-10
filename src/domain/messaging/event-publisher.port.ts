export interface DriverEvent {
  eventType: 'driver.registered' | 'driver.status.changed' | 'driver.updated' | 'driver.deleted';
  driverId: string;
  timestamp: string;
  data: {
    driver_id: string;
    name: string;
    phone?: string;
    vehicle_type?: string;
    vehicle_plate?: string;
    is_active?: boolean;
    vehicle_model?: string;
    vehicle_year?: number;
    vehicle_color?: string;
    vehicle_capacity?: number;
    [key: string]: any;
  };
}

export interface EventPublisherPort {
  publish(topic: string, event: DriverEvent, partition?: number): Promise<void>;
  publishBatch(events: Array<{ topic: string; event: DriverEvent; partition?: number }>): Promise<void>;
}

