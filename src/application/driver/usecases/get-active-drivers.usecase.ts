import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';

export class GetActiveDriversUseCase {
  constructor(private repo: DriverRepositoryPort) {}

  async execute() {
    const drivers = await this.repo.findAll();
    return drivers.filter((d) => d.isActive === true);
  }
}


