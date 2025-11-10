import { DriverEvent } from '../../domain/messaging/event-publisher.port';
import { Driver } from '../../domain/driver/driver.entity';

export class DriverEventFactory {
  static createDriverRegisteredEvent(driver: Driver): DriverEvent {
    return {
      eventType: 'driver.registered',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        driver_id: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        vehicle_type: driver.vehicleType,
        vehicle_plate: driver.vehiclePlate,
        is_active: driver.isActive,
        vehicle_model: driver.vehicleModel,
        vehicle_year: driver.vehicleYear,
        vehicle_color: driver.vehicleColor,
        vehicle_capacity: driver.vehicleCapacity,
        created_at: driver.createdAt.toISOString(),
        updated_at: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverStatusChangedEvent(driver: Driver, oldStatus: boolean): DriverEvent {
    return {
      eventType: 'driver.status.changed',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        driver_id: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        is_active: driver.isActive,
        old_status: oldStatus,
        new_status: driver.isActive,
        vehicle_plate: driver.vehiclePlate,
        updated_at: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverUpdatedEvent(driver: Driver, changes: Record<string, any>): DriverEvent {
    return {
      eventType: 'driver.updated',
      driverId: driver.id,
      timestamp: new Date().toISOString(),
      data: {
        driver_id: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        vehicle_type: driver.vehicleType,
        vehicle_plate: driver.vehiclePlate,
        is_active: driver.isActive,
        vehicle_model: driver.vehicleModel,
        vehicle_year: driver.vehicleYear,
        vehicle_color: driver.vehicleColor,
        vehicle_capacity: driver.vehicleCapacity,
        changes,
        updated_at: driver.updatedAt.toISOString(),
      },
    };
  }

  static createDriverDeletedEvent(driverId: string, driverName: string, vehiclePlate: string): DriverEvent {
    return {
      eventType: 'driver.deleted',
      driverId,
      timestamp: new Date().toISOString(),
      data: {
        driver_id: driverId,
        name: driverName,
        vehicle_plate: vehiclePlate,
        deleted_at: new Date().toISOString(),
      },
    };
  }
}

