# Driver Data Files

This directory contains CSV files for seeding driver data into the database.

## File Format

The CSV file should have the following columns:

- `id` (required): Unique identifier for the driver
- `name` (required): Driver's full name
- `vehicle` (required): Vehicle type/category (e.g., "Sedan", "SUV", "Van")
- `plate` (required): License plate number (must be unique)
- `isActive` (optional): Driver status - "true" or "false" (defaults to "true")
- `vehicleType` (optional): Detailed vehicle type (e.g., "Car", "SUV", "Van", "Motorcycle")
- `vehicleModel` (optional): Vehicle model name (e.g., "Toyota Camry")
- `vehicleYear` (optional): Manufacturing year (e.g., 2020)
- `vehicleColor` (optional): Vehicle color (e.g., "Blue", "Red")
- `vehicleCapacity` (optional): Maximum passenger capacity (e.g., 4, 5, 7)

## Usage

### Using the default CSV file:

```bash
npm run seed:drivers
```

### Using a custom CSV file:

```bash
npm run seed:drivers path/to/your/drivers.csv
```

## Example CSV Format

```csv
id,name,vehicle,plate,isActive,vehicleType,vehicleModel,vehicleYear,vehicleColor,vehicleCapacity
driver1,John Doe,Sedan,ABC123,true,Car,Toyota Camry,2020,Blue,4
driver2,Jane Smith,SUV,XYZ789,true,SUV,Honda CR-V,2021,White,5
```

## Notes

- The script will skip drivers with duplicate plate numbers
- All required fields must be present
- The script will validate data types (vehicleYear and vehicleCapacity must be numbers)
- Activity logs will be automatically created for each registered driver

