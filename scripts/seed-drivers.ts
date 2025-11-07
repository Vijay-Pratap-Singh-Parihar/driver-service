import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { MongoDBConfig } from '../src/infrastructure/database/mongodb.config';
import { DriverRepositoryMongoDB } from '../src/infrastructure/repositories/driver.repository.mongodb';
import { DriverActivityRepositoryMongoDB } from '../src/infrastructure/repositories/driver-activity.repository.mongodb';
import { RegisterDriverUseCase } from '../src/application/driver/usecases/register-driver.usecase';

interface DriverCSVRow {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  isActive?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  vehicleCapacity?: string;
}

interface SeedResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ row: number; plate: string; error: string }>;
}

async function seedDrivers() {
  console.log('🌱 Starting driver seeding process...\n');

  // Get CSV file path from command line argument or use default
  const csvFilePath =
    process.argv[2] || path.join(__dirname, '../data/drivers.csv');

  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Error: CSV file not found at ${csvFilePath}`);
    console.log('Usage: npm run seed:drivers [path/to/drivers.csv]');
    process.exit(1);
  }

  // Connect to MongoDB
  const mongoConfig = MongoDBConfig.getInstance();
  try {
    await mongoConfig.connect();
    console.log('✓ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  // Initialize repositories and use cases
  const driverRepository = new DriverRepositoryMongoDB();
  const activityRepository = new DriverActivityRepositoryMongoDB();
  const registerDriverUseCase = new RegisterDriverUseCase(
    driverRepository,
    activityRepository
  );

  // Read and parse CSV file
  console.log(`📖 Reading CSV file: ${csvFilePath}`);
  let csvContent: string;
  try {
    csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  } catch (error) {
    console.error('❌ Error reading CSV file:', error);
    await mongoConfig.disconnect();
    process.exit(1);
  }

  // Parse CSV
  let records: DriverCSVRow[];
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: true,
    }) as DriverCSVRow[];
    console.log(`✓ Parsed ${records.length} records from CSV\n`);
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    await mongoConfig.disconnect();
    process.exit(1);
  }

  // Validate CSV structure
  const requiredColumns = ['id', 'name', 'vehicle', 'plate'];
  const firstRow = records[0];
  if (!firstRow) {
    console.error('❌ Error: CSV file is empty');
    await mongoConfig.disconnect();
    process.exit(1);
  }

  const missingColumns = requiredColumns.filter(
    (col) => !(col in firstRow)
  );
  if (missingColumns.length > 0) {
    console.error(
      `❌ Error: CSV missing required columns: ${missingColumns.join(', ')}`
    );
    await mongoConfig.disconnect();
    process.exit(1);
  }

  // Seed drivers
  const result: SeedResult = {
    total: records.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log('🚀 Starting to seed drivers...\n');

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNumber = i + 2; // +2 because CSV has header and is 1-indexed

    try {
      // Validate required fields
      if (!row.id || !row.name || !row.vehicle || !row.plate) {
        throw new Error(
          'Missing required fields: id, name, vehicle, or plate'
        );
      }

      // Check if driver with this plate already exists
      const existingDriver = await driverRepository.findByPlate(row.plate);
      if (existingDriver) {
        result.skipped++;
        console.log(
          `⏭️  [${rowNumber}] Skipped ${row.name} (${row.plate}) - already exists`
        );
        continue;
      }

      // Prepare driver data
      const driverData = {
        id: row.id.trim(),
        name: row.name.trim(),
        vehicle: row.vehicle.trim(),
        plate: row.plate.trim(),
        vehicleType: row.vehicleType?.trim(),
        vehicleModel: row.vehicleModel?.trim(),
        vehicleYear: row.vehicleYear ? parseInt(row.vehicleYear, 10) : undefined,
        vehicleColor: row.vehicleColor?.trim(),
        vehicleCapacity: row.vehicleCapacity
          ? parseInt(row.vehicleCapacity, 10)
          : undefined,
      };

      // Validate vehicleYear if provided
      if (driverData.vehicleYear !== undefined && isNaN(driverData.vehicleYear)) {
        throw new Error(`Invalid vehicleYear: ${row.vehicleYear}`);
      }

      // Validate vehicleCapacity if provided
      if (
        driverData.vehicleCapacity !== undefined &&
        isNaN(driverData.vehicleCapacity)
      ) {
        throw new Error(`Invalid vehicleCapacity: ${row.vehicleCapacity}`);
      }

      // Register driver
      await registerDriverUseCase.execute(driverData);
      result.successful++;
      console.log(
        `✓ [${rowNumber}] Registered ${driverData.name} (${driverData.plate})`
      );
    } catch (error: any) {
      result.failed++;
      const errorMessage =
        error.message || error.toString() || 'Unknown error';
      result.errors.push({
        row: rowNumber,
        plate: row.plate || 'N/A',
        error: errorMessage,
      });
      console.error(
        `❌ [${rowNumber}] Failed to register ${row.name || 'N/A'} (${row.plate || 'N/A'}): ${errorMessage}`
      );
    }

    // Show progress every 10 records
    if ((i + 1) % 10 === 0) {
      console.log(`   Progress: ${i + 1}/${records.length} processed\n`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary');
  console.log('='.repeat(60));
  console.log(`Total records:     ${result.total}`);
  console.log(`✓ Successful:      ${result.successful}`);
  console.log(`⏭️  Skipped:         ${result.skipped}`);
  console.log(`❌ Failed:          ${result.failed}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((err) => {
      console.log(`   Row ${err.row} (${err.plate}): ${err.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // Disconnect from MongoDB
  await mongoConfig.disconnect();
  console.log('\n✓ Disconnected from MongoDB');
  console.log('✨ Seeding process completed!\n');

  // Exit with error code if there were failures
  process.exit(result.failed > 0 ? 1 : 0);
}

// Run the seeding function
seedDrivers().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

