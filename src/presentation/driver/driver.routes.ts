import { Router } from 'express';
import { DriverController } from './driver.controller';

export function createDriverRoutes(controller: DriverController) {
  const router = Router();
  router.get('/', controller.list);
  router.get('/active', controller.getActiveDrivers);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  router.put('/:id/status', controller.setStatus);
  router.get('/:id/activity', controller.getActivity);
  return router;
}
