import { DriverEvent } from '../../domain/messaging/event-publisher.port';
import { Driver } from '../../domain/driver/driver.entity';

export class DriverEventFactory {
  static createDriverRegisteredEvent(driver: Driver): DriverEvent {
    return {
      eventType: 'driver.registered',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        id: driver.id,
        name: driver.name,
        vehicle: driver.vehicle,
        plate: driver.plate,
        isActive: driver.isActive,
        vehicleType: driver.vehicleType,
        vehicleModel: driver.vehicleModel,
        vehicleYear: driver.vehicleYear,
        vehicleColor: driver.vehicleColor,
        vehicleCapacity: driver.vehicleCapacity,
        createdAt: driver.createdAt.toISOString(),
        updatedAt: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverStatusChangedEvent(driver: Driver, oldStatus: boolean): DriverEvent {
    return {
      eventType: 'driver.status.changed',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        id: driver.id,
        name: driver.name,
        isActive: driver.isActive,
        oldStatus,
        newStatus: driver.isActive,
        plate: driver.plate,
        updatedAt: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverUpdatedEvent(driver: Driver, changes: Record<string, any>): DriverEvent {
    return {
      eventType: 'driver.updated',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        id: driver.id,
        name: driver.name,
        vehicle: driver.vehicle,
        plate: driver.plate,
        isActive: driver.isActive,
        vehicleType: driver.vehicleType,
        vehicleModel: driver.vehicleModel,
        vehicleYear: driver.vehicleYear,
        vehicleColor: driver.vehicleColor,
        vehicleCapacity: driver.vehicleCapacity,
        changes,
        updatedAt: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverDeletedEvent(driverId: string, driverName: string, plate: string): DriverEvent {
    return {
      eventType: 'driver.deleted',
      driverId,
      timestamp: new Date().toISOString(),
      data: {
        id: driverId,
        name: driverName,
        plate,
        deletedAt: new Date().toISOString(),
      },
    };
  }
}

