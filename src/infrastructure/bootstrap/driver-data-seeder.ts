import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

import { RegisterDriverUseCase } from '../../application/driver/usecases/register-driver.usecase';
import { DriverActivityRepositoryMongoDB } from '../repositories/driver-activity.repository.mongodb';
import { DriverRepositoryMongoDB } from '../repositories/driver.repository.mongodb';
import { DriverModel } from '../database/driver.schema';
import { Logger } from '../../shared/logging/logger';
import { EventPublisherPort } from '../../domain/messaging/event-publisher.port';
import { ConflictError } from '../../shared/errors/app-error';

const DEFAULT_MIN_DRIVER_COUNT = 70;
const DEFAULT_CSV_PATH = path.resolve(__dirname, '../../..', 'rhfd_drivers.csv');

type DriverCsvRow = {
  driver_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  is_active?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  vehicle_capacity?: string;
};

interface DriverSeedOptions {
  driverRepository: DriverRepositoryMongoDB;
  activityRepository: DriverActivityRepositoryMongoDB;
  eventPublisher?: EventPublisherPort;
  csvFilePath?: string;
  minDriverCount?: number;
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (['true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }

  return undefined;
}

function parseInteger(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function seedDriversOnStartup(options: DriverSeedOptions): Promise<void> {
  const minCount =
    options.minDriverCount ??
    Number.parseInt(process.env.DRIVER_SEED_MIN_COUNT || `${DEFAULT_MIN_DRIVER_COUNT}`, 10);
  const csvFilePath = options.csvFilePath ?? process.env.DRIVER_SEED_CSV ?? DEFAULT_CSV_PATH;

  let currentCount = 0;
  try {
    currentCount = await DriverModel.estimatedDocumentCount();
  } catch (error) {
    Logger.error('Driver seed skipped: failed to fetch document count', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  if (currentCount >= minCount) {
    Logger.info('Driver seed skipped: collection already has sufficient documents', undefined, {
      currentCount,
      minCount,
    });
    return;
  }

  try {
    await fs.access(csvFilePath);
  } catch {
    Logger.warn('Driver seed skipped: CSV file not found', undefined, { csvFilePath });
    return;
  }

  try {
    await DriverModel.updateMany(
      {
        $or: [{ plate: { $exists: false } }, { plate: null }],
      },
      [
        {
          $set: {
            plate: '$vehicle_plate',
          },
        },
      ]
    );
  } catch (error) {
    Logger.warn('Driver seed warning: failed to backfill legacy plate field', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  let csvContent: string;
  try {
    csvContent = await fs.readFile(csvFilePath, 'utf-8');
  } catch (error) {
    Logger.error('Driver seed failed: unable to read CSV file', undefined, {
      csvFilePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  let rows: DriverCsvRow[];
  try {
    rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as DriverCsvRow[];
  } catch (error) {
    Logger.error('Driver seed failed: unable to parse CSV file', undefined, {
      csvFilePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  if (!rows.length) {
    Logger.warn('Driver seed skipped: CSV file is empty', undefined, { csvFilePath });
    return;
  }

  const registerUseCase = new RegisterDriverUseCase(
    options.driverRepository,
    options.activityRepository,
    options.eventPublisher
  );

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2; // 1-based + header

    const driverId = row.driver_id?.trim();
    const name = row.name?.trim();
    const phone = row.phone?.trim();
    const vehicleType = row.vehicle_type?.trim();
    const vehiclePlate = row.vehicle_plate?.trim();

    if (!driverId || !name || !phone || !vehicleType || !vehiclePlate) {
      failed += 1;
      Logger.warn('Driver seed row skipped due to missing required fields', undefined, {
        rowNumber,
        driverId,
        vehiclePlate,
      });
      continue;
    }

    try {
      await registerUseCase.execute({
        driver_id: driverId,
        name,
        phone,
        vehicle_type: vehicleType,
        vehicle_plate: vehiclePlate,
        is_active: parseBoolean(row.is_active),
        vehicle_model: row.vehicle_model?.trim() || undefined,
        vehicle_year: parseInteger(row.vehicle_year),
        vehicle_color: row.vehicle_color?.trim() || undefined,
        vehicle_capacity: parseInteger(row.vehicle_capacity),
      });

      inserted += 1;
    } catch (error) {
      if (error instanceof ConflictError) {
        skipped += 1;
        Logger.debug('Driver seed row skipped because driver already exists', undefined, {
          rowNumber,
          driverId,
          vehiclePlate,
        });
        continue;
      }

      failed += 1;
      Logger.warn('Driver seed row failed unexpectedly', undefined, {
        rowNumber,
        driverId,
        vehiclePlate,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  Logger.info('Driver seed completed', undefined, {
    inserted,
    skipped,
    failed,
    csvFilePath,
  });
}


