import { DriverRepositoryPort } from '../../domain/driver/driver.repository.port';
import { Driver } from '../../domain/driver/driver.entity';

export class DriverRepositoryMemory implements DriverRepositoryPort {
  private drivers = new Map<string, Driver>();

  async save(driver: Driver): Promise<Driver> {
    this.drivers.set(driver.id, driver);
    return driver;
  }

  async findById(id: string): Promise<Driver | null> {
    return this.drivers.get(id) || null;
  }

  async findByPlate(plate: string): Promise<Driver | null> {
    const drivers = Array.from(this.drivers.values());
    return drivers.find((d) => d.vehiclePlate === plate) || null;
  }

  async findAll(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async delete(id: string): Promise<boolean> {
    return this.drivers.delete(id);
  }
}
