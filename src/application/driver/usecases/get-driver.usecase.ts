import { DriverRepositoryPort } from '../../../domain/driver/driver.repository.port';
import { NotFoundError } from '../../../shared/errors/app-error';

export class GetDriverUseCase {
  constructor(private repo: DriverRepositoryPort) {}

  async execute(id: string) {
    if (!id) {
      throw new NotFoundError('Driver');
    }
    const driver = await this.repo.findById(id);
    if (!driver) {
      throw new NotFoundError('Driver');
    }
    return driver;
  }
}

