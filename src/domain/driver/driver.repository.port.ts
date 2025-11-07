import { Driver } from './driver.entity';

export interface DriverRepositoryPort {
  save(driver: Driver): Promise<Driver>;
  findById(id: string): Promise<Driver | null>;
  findByPlate(plate: string): Promise<Driver | null>;
  findAll(): Promise<Driver[]>;
  delete(id: string): Promise<boolean>;
}
