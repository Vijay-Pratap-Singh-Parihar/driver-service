import { Request, Response, NextFunction } from 'express';
import { RegisterDriverUseCase } from '../../application/driver/usecases/register-driver.usecase';
import { ToggleDriverStatusUseCase } from '../../application/driver/usecases/toggle-status.usecase';
import { GetAllDriversUseCase } from '../../application/driver/usecases/get-all-drivers.usecase';
import { GetDriverUseCase } from '../../application/driver/usecases/get-driver.usecase';
import { UpdateDriverUseCase } from '../../application/driver/usecases/update-driver.usecase';
import { DeleteDriverUseCase } from '../../application/driver/usecases/delete-driver.usecase';
import { GetDriverActivityUseCase } from '../../application/driver/usecases/get-driver-activity.usecase';
import { GetActiveDriversUseCase } from '../../application/driver/usecases/get-active-drivers.usecase';
import { Logger } from '../../shared/logging/logger';

export class DriverController {
  constructor(
    private registerDriver: RegisterDriverUseCase,
    private toggleStatus: ToggleDriverStatusUseCase,
    private getAllDrivers: GetAllDriversUseCase,
    private getActiveDriversUseCase: GetActiveDriversUseCase,
    private getDriver: GetDriverUseCase,
    private updateDriver: UpdateDriverUseCase,
    private deleteDriver: DeleteDriverUseCase,
    private getDriverActivity: GetDriverActivityUseCase
  ) {}

  list = async (_: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const drivers = await this.getAllDrivers.execute();
      Logger.info('Listed all drivers', correlationId, { count: drivers.length });
      res.json(drivers);
    } catch (e) {
      Logger.error('Failed to list drivers', correlationId, { error: String(e) });
      next(e);
    }
  };

  getActiveDrivers = async (_: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const drivers = await this.getActiveDriversUseCase.execute();
      Logger.info('Listed active drivers', correlationId, { count: drivers.length });
      res.json(drivers);
    } catch (e) {
      Logger.error('Failed to list active drivers', correlationId, { error: String(e) });
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const driver = await this.registerDriver.execute(req.body);
      Logger.info('Driver registered', correlationId, { driverId: driver.id, plate: driver.plate });
      res.status(201).json(driver);
    } catch (e) {
      Logger.error('Failed to register driver', correlationId, { error: String(e), body: req.body });
      next(e);
    }
  };

  setStatus = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const { isActive } = req.body as { isActive: boolean };
      const driver = await this.toggleStatus.execute(req.params.id, isActive);
      Logger.info('Driver status changed', correlationId, { driverId: driver.id, isActive: driver.isActive });
      res.json(driver);
    } catch (e) {
      Logger.error('Failed to change driver status', correlationId, { error: String(e), driverId: req.params.id });
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const driver = await this.getDriver.execute(req.params.id);
      Logger.debug('Retrieved driver', correlationId, { driverId: driver.id });
      res.json(driver);
    } catch (e) {
      Logger.error('Failed to get driver', correlationId, { error: String(e), driverId: req.params.id });
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const driver = await this.updateDriver.execute(req.params.id, req.body);
      Logger.info('Driver updated', correlationId, { driverId: driver.id });
      res.json(driver);
    } catch (e) {
      Logger.error('Failed to update driver', correlationId, { error: String(e), driverId: req.params.id });
      next(e);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const result = await this.deleteDriver.execute(req.params.id);
      Logger.info('Driver deleted', correlationId, { driverId: req.params.id });
      res.json(result);
    } catch (e) {
      Logger.error('Failed to delete driver', correlationId, { error: String(e), driverId: req.params.id });
      next(e);
    }
  };

  getActivity = async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = res.locals.correlationId as string;
    try {
      const activities = await this.getDriverActivity.execute(req.params.id);
      Logger.debug('Retrieved driver activity', correlationId, { driverId: req.params.id, count: activities.length });
      res.json(activities);
    } catch (e) {
      Logger.error('Failed to get driver activity', correlationId, { error: String(e), driverId: req.params.id });
      next(e);
    }
  };
}
