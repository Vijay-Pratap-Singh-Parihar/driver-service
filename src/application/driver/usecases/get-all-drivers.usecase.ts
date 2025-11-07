import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';

export class GetAllDriversUseCase {
  constructor(private repo: DriverRepositoryPort) {}
  async execute() {
    return await this.repo.findAll();
  }
}
