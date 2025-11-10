# 🚕 Driver Service API Documentation

Complete API reference with curl examples for all endpoints.

**Base URL**: `http://localhost:3001`

---

## 📋 Table of Contents

- [Health Check](#health-check)
- [List All Drivers](#list-all-drivers)
- [Get Driver by ID](#get-driver-by-id)
- [Register New Driver](#register-new-driver)
- [Update Driver](#update-driver)
- [Delete Driver](#delete-driver)
- [Toggle Driver Status](#toggle-driver-status)
- [Get Driver Activity History](#get-driver-activity-history)

---

## Health Check

Check if the service is running.

### Request

```bash
curl -X GET http://localhost:3001/health
```

### Response

```json
{
  "status": "OK",
  "service": "driver-service"
}
```

---

## List All Drivers

Get a list of all drivers in the system.

### Request

```bash
curl -X GET http://localhost:3001/v1/drivers
```

### Response

```json
[
  {
    "id": "driver1",
    "driver_id": "driver1",
    "name": "John Doe",
    "phone": "555-0001",
    "vehicle_type": "Car",
    "vehicle_plate": "ABC123",
    "is_active": true,
    "vehicle_model": "Toyota Camry",
    "vehicle_year": 2020,
    "vehicle_color": "Blue",
    "vehicle_capacity": 4,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "driver2",
    "driver_id": "driver2",
    "name": "Jane Smith",
    "phone": "555-0002",
    "vehicle_type": "SUV",
    "vehicle_plate": "XYZ789",
    "is_active": true,
    "vehicle_model": "Honda CR-V",
    "vehicle_year": 2021,
    "vehicle_color": "White",
    "vehicle_capacity": 5,
    "created_at": "2024-01-15T10:31:00.000Z",
    "updated_at": "2024-01-15T10:31:00.000Z"
  }
]
```

### Pretty Print (with jq)

```bash
curl -X GET http://localhost:3001/v1/drivers | jq
```

---

## Get Driver by ID

Get a specific driver by their ID.

### Request

```bash
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011
```

### Response

```json
{
  "id": "driver1",
  "driver_id": "driver1",
  "name": "John Doe",
  "phone": "555-0001",
  "vehicle_type": "Car",
  "vehicle_plate": "ABC123",
  "is_active": true,
  "vehicle_model": "Toyota Camry",
  "vehicle_year": 2020,
  "vehicle_color": "Blue",
  "vehicle_capacity": 4,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (404)

```json
{
  "error": {
    "message": "Driver not found",
    "statusCode": 404
  }
}
```

---

## Register New Driver

Register a new driver in the system.

### Request

```bash
curl -X POST http://localhost:3001/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "driver1",
    "name": "John Doe",
    "phone": "555-0001",
    "vehicle_type": "Car",
    "vehicle_plate": "ABC123",
    "is_active": true,
    "vehicle_model": "Toyota Camry",
    "vehicle_year": 2020,
    "vehicle_color": "Blue",
    "vehicle_capacity": 4
  }'
```

### Minimal Request (only required fields)

```bash
curl -X POST http://localhost:3001/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "driver1",
    "name": "John Doe",
    "phone": "555-0001",
    "vehicle_type": "Car",
    "vehicle_plate": "ABC123"
  }'
```

### Response (201 Created)

```json
{
  "id": "driver1",
  "driver_id": "driver1",
  "name": "John Doe",
  "phone": "555-0001",
  "vehicle_type": "Car",
  "vehicle_plate": "ABC123",
  "is_active": true,
  "vehicle_model": "Toyota Camry",
  "vehicle_year": 2020,
  "vehicle_color": "Blue",
  "vehicle_capacity": 4,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (400 - Validation Error)

```json
{
  "error": {
    "message": "driver_id, name, phone, vehicle_type, vehicle_plate are required",
    "statusCode": 400
  }
}
```

### Error Response (409 - Conflict)

```json
{
  "error": {
    "message": "vehicle_plate already exists",
    "statusCode": 409
  }
}
```

---

## Update Driver

Update an existing driver's information.

### Request

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "555-9999",
    "vehicle_type": "SUV",
    "vehicle_plate": "XYZ999",
    "vehicle_model": "Toyota RAV4",
    "vehicle_year": 2022,
    "vehicle_color": "Red",
    "vehicle_capacity": 5
  }'
```

### Update Profile Only

```bash
  curl -X PUT http://localhost:3001/v1/drivers/driver1 \
    -H "Content-Type: application/json" \
    -d '{
      "name": "John Updated",
      "phone": "555-9999",
      "vehicle_type": "SUV"
    }'
```

### Update Vehicle Info Only

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1 \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_model": "Toyota RAV4",
    "vehicle_year": 2022,
    "vehicle_color": "Red",
    "vehicle_capacity": 5
  }'
```

### Response

```json
{
  "id": "driver1",
  "driver_id": "driver1",
  "name": "John Updated",
  "phone": "555-9999",
  "vehicle_type": "SUV",
  "vehicle_plate": "XYZ999",
  "is_active": true,
  "vehicle_model": "Toyota RAV4",
  "vehicle_year": 2022,
  "vehicle_color": "Red",
  "vehicle_capacity": 5,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### Error Response (404)

```json
{
  "error": {
    "message": "Driver not found",
    "statusCode": 404
  }
}
```

### Error Response (400 - Duplicate Plate)

```json
{
  "error": {
    "message": "vehicle_plate already exists",
    "statusCode": 400
  }
}
```

---

## Delete Driver

Delete a driver from the system.

### Request

```bash
curl -X DELETE http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011
```

### Response

```json
{
  "success": true,
  "message": "Driver deleted successfully"
}
```

### Error Response (404)

```json
{
  "error": {
    "message": "Driver not found",
    "statusCode": 404
  }
}
```

---

## Toggle Driver Status

Toggle a driver's active/inactive status.

### Request (Activate Driver)

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1/status \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": true
  }'
```

### Request (Deactivate Driver)

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1/status \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

### Response

```json
{
  "id": "driver1",
  "driver_id": "driver1",
  "name": "John Doe",
  "phone": "555-0001",
  "vehicle_type": "Car",
  "vehicle_plate": "ABC123",
  "is_active": false,
  "vehicle_model": "Toyota Camry",
  "vehicle_year": 2020,
  "vehicle_color": "Blue",
  "vehicle_capacity": 4,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### Error Response (404)

```json
{
  "error": {
    "message": "Driver not found",
    "statusCode": 404
  }
}
```

### Error Response (400)

```json
{
  "error": {
    "message": "is_active must be boolean",
    "statusCode": 400
  }
}
```

---

## Get Driver Activity History

Get the activity history for a specific driver.

### Request

```bash
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/activity
```

### Response

```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "driver_id": "driver1",
    "action": "CREATED",
    "old_value": null,
    "new_value": null,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "metadata": null
  },
  {
    "id": "507f1f77bcf86cd799439021",
    "driver_id": "driver1",
    "action": "STATUS_CHANGED",
    "old_value": "true",
    "new_value": "false",
    "timestamp": "2024-01-15T11:00:00.000Z",
    "metadata": {
      "vehicle_plate": "ABC123"
    }
  },
  {
    "id": "507f1f77bcf86cd799439022",
    "driver_id": "driver1",
    "action": "VEHICLE_UPDATED",
    "old_value": null,
    "new_value": null,
    "timestamp": "2024-01-15T11:30:00.000Z",
    "metadata": {
      "vehicle_type": "SUV",
      "vehicle_model": "Toyota RAV4",
      "vehicle_year": 2022,
      "vehicle_color": "Red",
      "vehicle_capacity": 5
    }
  },
  {
    "id": "507f1f77bcf86cd799439023",
    "driver_id": "driver1",
    "action": "PROFILE_UPDATED",
    "old_value": null,
    "new_value": null,
    "timestamp": "2024-01-15T12:00:00.000Z",
    "metadata": {
      "name": "John Updated",
      "phone": "555-9999",
      "vehicle_type": "SUV",
      "vehicle_plate": "XYZ999"
    }
  }
]
```

### Activity Actions

The following activity actions are tracked:

- `CREATED` - Driver was registered
- `STATUS_CHANGED` - Driver status (active/inactive) was changed
- `PROFILE_UPDATED` - Driver profile (name, phone, vehicle_type, vehicle_plate) was updated
- `VEHICLE_UPDATED` - Vehicle details were updated
- `DELETED` - Driver was deleted

### Error Response (404)

```json
{
  "error": {
    "message": "Driver not found",
    "statusCode": 404
  }
}
```

---

## 📝 Complete Workflow Example

Here's a complete workflow example:

### 1. Health Check

```bash
curl -X GET http://localhost:3001/health
```

### 2. Register a New Driver

```bash
curl -X POST http://localhost:3001/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "driver1",
    "name": "John Doe",
    "phone": "555-0001",
    "vehicle_type": "Car",
    "vehicle_plate": "ABC123",
    "vehicle_model": "Toyota Camry",
    "vehicle_year": 2020,
    "vehicle_color": "Blue",
    "vehicle_capacity": 4
  }'
```

**Save the driver ID from response** (e.g., `driver1`)

### 3. Get the Driver

```bash
curl -X GET http://localhost:3001/v1/drivers/driver1
```

### 4. Update the Driver

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "555-9999",
    "vehicle_type": "SUV",
    "vehicle_plate": "XYZ999"
  }'
```

### 5. Toggle Driver Status

```bash
curl -X PUT http://localhost:3001/v1/drivers/driver1/status \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

### 6. Get Activity History

```bash
curl -X GET http://localhost:3001/v1/drivers/driver1/activity
```

### 7. List All Drivers

```bash
curl -X GET http://localhost:3001/v1/drivers
```

### 8. Delete the Driver

```bash
curl -X DELETE http://localhost:3001/v1/drivers/driver1
```

---

## 🔧 Using with Variables

You can use shell variables to make testing easier:

```bash
# Set base URL
BASE_URL="http://localhost:3001"
DRIVER_ID="driver1"

# Health check
curl -X GET $BASE_URL/health

# Get driver
curl -X GET $BASE_URL/v1/drivers/$DRIVER_ID

# Update driver
curl -X PUT $BASE_URL/v1/drivers/$DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "phone": "555-9999"}'
```

---

## 🎨 Pretty Print with jq

For better readability, use `jq` to format JSON responses:

```bash
# Install jq: brew install jq (macOS) or apt-get install jq (Linux)

curl -X GET http://localhost:3001/v1/drivers | jq
curl -X GET http://localhost:3001/v1/drivers/driver1 | jq
curl -X GET http://localhost:3001/v1/drivers/driver1/activity | jq
```

---

## 📊 Response Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Validation error |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 500  | Internal Server Error - Server error |

---

## 🚨 Error Response Format

All errors follow this format:

```json
{
  "error": {
    "message": "Error message here",
    "statusCode": 400
  }
}
```

---

## 📌 Notes

- All timestamps are in ISO 8601 format (UTC)
- `driver_id` values must be unique (we recommend using a UUID or slug)
- `vehicle_plate` values must be unique across all drivers
- The `is_active` field defaults to `true` when creating a new driver
- Activity history is sorted by timestamp (newest first)
- Extended vehicle fields (`vehicle_model`, `vehicle_year`, `vehicle_color`, `vehicle_capacity`) are optional

---

## 🔗 Related Documentation

- [Seeding Script Documentation](./scripts/README.md)
- [CSV Format Documentation](./data/README.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

