# Driver Service - Seeding Scripts

This directory contains scripts for seeding data into the driver service database.

## Seed Drivers Script

The `seed-drivers.ts` script loads driver data from a CSV file into MongoDB.

### Prerequisites

1. MongoDB must be running and accessible
2. Environment variables must be set (see `.env.example`)
3. Dependencies must be installed: `npm install`

### Usage

#### Using the default CSV file (`data/drivers.csv`):

```bash
npm run seed:drivers
```

#### Using a custom CSV file:

```bash
npm run seed:drivers path/to/your/drivers.csv
```

### CSV File Format

The CSV file must have the following columns:

**Required columns:**
- `id` - Unique identifier for the driver
- `name` - Driver's full name
- `vehicle` - Vehicle type/category (e.g., "Sedan", "SUV", "Van")
- `plate` - License plate number (must be unique)

**Optional columns:**
- `isActive` - "true" or "false" (defaults to "true")
- `vehicleType` - Detailed vehicle type (e.g., "Car", "SUV", "Van")
- `vehicleModel` - Vehicle model name (e.g., "Toyota Camry")
- `vehicleYear` - Manufacturing year (number)
- `vehicleColor` - Vehicle color (e.g., "Blue", "Red")
- `vehicleCapacity` - Maximum passenger capacity (number)

### Example CSV

```csv
id,name,vehicle,plate,isActive,vehicleType,vehicleModel,vehicleYear,vehicleColor,vehicleCapacity
driver1,John Doe,Sedan,ABC123,true,Car,Toyota Camry,2020,Blue,4
driver2,Jane Smith,SUV,XYZ789,true,SUV,Honda CR-V,2021,White,5
```

### Features

- ✅ Validates CSV structure and required fields
- ✅ Skips duplicate drivers (by plate number)
- ✅ Validates data types (vehicleYear, vehicleCapacity must be numbers)
- ✅ Creates activity logs for each registered driver
- ✅ Provides detailed progress and error reporting
- ✅ Shows summary statistics after completion

### Output

The script provides:
- Real-time progress updates
- Success/failure status for each driver
- Summary statistics (total, successful, skipped, failed)
- Detailed error messages for failed records

### Example Output

```
🌱 Starting driver seeding process...

✓ Connected to MongoDB

📖 Reading CSV file: data/drivers.csv
✓ Parsed 20 records from CSV

🚀 Starting to seed drivers...

✓ [2] Registered John Doe (ABC123)
✓ [3] Registered Jane Smith (XYZ789)
⏭️  [4] Skipped Mike Johnson (DEF456) - already exists
❌ [5] Failed to register Invalid Driver (INV123): Missing required fields

============================================================
📊 Seeding Summary
============================================================
Total records:     20
✓ Successful:      18
⏭️  Skipped:         1
❌ Failed:          1
============================================================
```

### Error Handling

The script handles:
- Missing CSV file
- Invalid CSV format
- Missing required columns
- Missing required fields in rows
- Duplicate plate numbers (skips with warning)
- Invalid data types
- Database connection errors

### Notes

- The script will exit with code 0 on success, code 1 if there are failures
- Duplicate drivers (same plate) are skipped, not updated
- Activity logs are automatically created for successfully registered drivers
- The script connects to MongoDB using the same configuration as the main service

