import { Request, Response } from 'express';
import { DriverRepositoryPort } from '../../domain/driver/driver.repository.port';

// Simple in-memory counters/gauges (Prometheus text exposition)
const counters: Record<string, number> = Object.create(null);

export const METRIC_DRIVER_REGISTRATIONS_TOTAL = 'driver_registrations_total';
export const METRIC_DRIVER_STATUS_CHANGES_TOTAL = 'driver_status_changes_total';
export const METRIC_DRIVERS_ACTIVE_TOTAL = 'drivers_active_total';
export const METRIC_DRIVERS_TOTAL = 'drivers_total';

export function inc(metric: string, by = 1) {
  counters[metric] = (counters[metric] || 0) + by;
}

export function set(metric: string, value: number) {
  counters[metric] = value;
}

export function createMetricsHandler(repo: DriverRepositoryPort) {
  return async (_req: Request, res: Response) => {
    // derive gauges from repository
    const all = await repo.findAll();
    set(METRIC_DRIVERS_TOTAL, all.length);
    set(METRIC_DRIVERS_ACTIVE_TOTAL, all.filter(d => d.isActive === true).length);

    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    let body = '';
    body += `# HELP ${METRIC_DRIVER_REGISTRATIONS_TOTAL} Total number of driver registrations\n`;
    body += `# TYPE ${METRIC_DRIVER_REGISTRATIONS_TOTAL} counter\n`;
    body += `${METRIC_DRIVER_REGISTRATIONS_TOTAL} ${counters[METRIC_DRIVER_REGISTRATIONS_TOTAL] || 0}\n`;

    body += `# HELP ${METRIC_DRIVER_STATUS_CHANGES_TOTAL} Total number of driver status changes\n`;
    body += `# TYPE ${METRIC_DRIVER_STATUS_CHANGES_TOTAL} counter\n`;
    body += `${METRIC_DRIVER_STATUS_CHANGES_TOTAL} ${counters[METRIC_DRIVER_STATUS_CHANGES_TOTAL] || 0}\n`;

    body += `# HELP ${METRIC_DRIVERS_TOTAL} Current total drivers\n`;
    body += `# TYPE ${METRIC_DRIVERS_TOTAL} gauge\n`;
    body += `${METRIC_DRIVERS_TOTAL} ${counters[METRIC_DRIVERS_TOTAL] || 0}\n`;

    body += `# HELP ${METRIC_DRIVERS_ACTIVE_TOTAL} Current active drivers\n`;
    body += `# TYPE ${METRIC_DRIVERS_ACTIVE_TOTAL} gauge\n`;
    body += `${METRIC_DRIVERS_ACTIVE_TOTAL} ${counters[METRIC_DRIVERS_ACTIVE_TOTAL] || 0}\n`;

    res.status(200).send(body);
  };
}


