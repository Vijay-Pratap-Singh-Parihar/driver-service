import { DriverRepositoryPort } from '../../domain/driver/driver.repository.port';
import { Driver } from '../../domain/driver/driver.entity';
import { DriverModel, DriverDocument } from '../database/driver.schema';

export class DriverRepositoryMongoDB implements DriverRepositoryPort {
  async save(driver: Driver): Promise<Driver> {
    const driverDoc: Partial<DriverDocument> & { _id?: string } = {
      driver_id: driver.driverId,
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicleType,
      vehicle_plate: driver.vehiclePlate,
      plate: driver.vehiclePlate,
      is_active: driver.isActive ?? true,
      vehicle_model: driver.vehicleModel,
      vehicle_year: driver.vehicleYear,
      vehicle_color: driver.vehicleColor,
      vehicle_capacity: driver.vehicleCapacity,
    };

    if (driver.id) {
      const existingDriver = await DriverModel.findOne({
        $or: [{ _id: driver.id }, { driver_id: driver.driverId }],
      });
      if (existingDriver) {
        const updatedDriver = await DriverModel.findByIdAndUpdate(
          existingDriver._id,
          { $set: driverDoc },
          { new: true, runValidators: true }
        );
        return this.mapToDomainEntity(updatedDriver!);
      }
      driverDoc._id = driver.id;
    }
    // Create new driver
    const newDriver = new DriverModel(driverDoc);
    const savedDriver = await newDriver.save();
    return this.mapToDomainEntity(savedDriver);
  }

  async findById(id: string): Promise<Driver | null> {
    const driverDoc = await DriverModel.findOne({ $or: [{ _id: id }, { driver_id: id }] });
    if (!driverDoc) {
      return null;
    }
    return this.mapToDomainEntity(driverDoc);
  }

  async findByPlate(plate: string): Promise<Driver | null> {
    const driverDoc = await DriverModel.findOne({ vehicle_plate: plate });
    if (!driverDoc) {
      return null;
    }
    return this.mapToDomainEntity(driverDoc);
  }

  async findAll(): Promise<Driver[]> {
    const driverDocs = await DriverModel.find();
    return driverDocs.map((doc) => this.mapToDomainEntity(doc));
  }

  async delete(id: string): Promise<boolean> {
    const result = await DriverModel.findOneAndDelete({ $or: [{ _id: id }, { driver_id: id }] });
    return !!result;
  }

  private mapToDomainEntity(driverDoc: DriverDocument): Driver {
    // Use a safe fallback for id in case _id is not present on the hydrated document
    const id: string | undefined = (driverDoc as any)?._id
      ? String((driverDoc as any)._id)
      : (driverDoc as any)?.id
        ? String((driverDoc as any).id)
        : undefined;

    if (!id) {
      throw new Error('Driver document missing _id');
    }

    return new Driver(
      id,
      driverDoc.driver_id,
      driverDoc.name,
      driverDoc.phone,
      driverDoc.vehicle_type,
      driverDoc.vehicle_plate,
      driverDoc.is_active ?? true,
      (driverDoc as any)?.createdAt || new Date(),
      (driverDoc as any)?.updatedAt || new Date(),
      driverDoc.vehicle_model,
      driverDoc.vehicle_year,
      driverDoc.vehicle_color,
      driverDoc.vehicle_capacity
    );
  }
}

