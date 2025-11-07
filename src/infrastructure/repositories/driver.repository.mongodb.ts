import { DriverRepositoryPort } from '../../domain/driver/driver.repository.port';
import { Driver } from '../../domain/driver/driver.entity';
import { DriverModel, DriverDocument } from '../database/driver.schema';

export class DriverRepositoryMongoDB implements DriverRepositoryPort {
  async save(driver: Driver): Promise<Driver> {
    const driverDoc: Partial<DriverDocument> = {
      name: driver.name,
      vehicle: driver.vehicle,
      plate: driver.plate,
      isActive: driver.isActive ?? true,
      vehicleType: driver.vehicleType,
      vehicleModel: driver.vehicleModel,
      vehicleYear: driver.vehicleYear,
      vehicleColor: driver.vehicleColor,
      vehicleCapacity: driver.vehicleCapacity,
    };

    if (driver.id) {
      const existingDriver = await DriverModel.findById(driver.id);
      if (existingDriver) {
        // Update existing driver
        const updatedDriver = await DriverModel.findByIdAndUpdate(
          driver.id,
          { $set: driverDoc },
          { new: true, runValidators: true }
        );
        return this.mapToDomainEntity(updatedDriver!);
      }
    }
    // Create new driver
    const newDriver = new DriverModel(driverDoc);
    const savedDriver = await newDriver.save();
    return this.mapToDomainEntity(savedDriver);
  }

  async findById(id: string): Promise<Driver | null> {
    const driverDoc = await DriverModel.findById(id);
    if (!driverDoc) {
      return null;
    }
    return this.mapToDomainEntity(driverDoc);
  }

  async findByPlate(plate: string): Promise<Driver | null> {
    const driverDoc = await DriverModel.findOne({ plate });
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
    const result = await DriverModel.findByIdAndDelete(id);
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
      driverDoc.name,
      driverDoc.vehicle,
      driverDoc.plate,
      driverDoc.isActive ?? true,
      (driverDoc as any)?.createdAt || new Date(),
      (driverDoc as any)?.updatedAt || new Date(),
      driverDoc.vehicleType,
      driverDoc.vehicleModel,
      driverDoc.vehicleYear,
      driverDoc.vehicleColor,
      driverDoc.vehicleCapacity
    );
  }
}

