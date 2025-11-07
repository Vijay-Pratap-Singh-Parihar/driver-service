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
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "vehicle": "Sedan",
    "plate": "ABC123",
    "isActive": true,
    "vehicleType": "Car",
    "vehicleModel": "Toyota Camry",
    "vehicleYear": 2020,
    "vehicleColor": "Blue",
    "vehicleCapacity": 4,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "vehicle": "SUV",
    "plate": "XYZ789",
    "isActive": true,
    "vehicleType": "SUV",
    "vehicleModel": "Honda CR-V",
    "vehicleYear": 2021,
    "vehicleColor": "White",
    "vehicleCapacity": 5,
    "createdAt": "2024-01-15T10:31:00.000Z",
    "updatedAt": "2024-01-15T10:31:00.000Z"
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
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "vehicle": "Sedan",
  "plate": "ABC123",
  "isActive": true,
  "vehicleType": "Car",
  "vehicleModel": "Toyota Camry",
  "vehicleYear": 2020,
  "vehicleColor": "Blue",
  "vehicleCapacity": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
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
    "id": "driver1",
    "name": "John Doe",
    "vehicle": "Sedan",
    "plate": "ABC123",
    "vehicleType": "Car",
    "vehicleModel": "Toyota Camry",
    "vehicleYear": 2020,
    "vehicleColor": "Blue",
    "vehicleCapacity": 4
  }'
```

### Minimal Request (only required fields)

```bash
curl -X POST http://localhost:3001/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "driver1",
    "name": "John Doe",
    "vehicle": "Sedan",
    "plate": "ABC123"
  }'
```

### Response (201 Created)

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "vehicle": "Sedan",
  "plate": "ABC123",
  "isActive": true,
  "vehicleType": "Car",
  "vehicleModel": "Toyota Camry",
  "vehicleYear": 2020,
  "vehicleColor": "Blue",
  "vehicleCapacity": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (400 - Validation Error)

```json
{
  "error": {
    "message": "id, name, vehicle, plate are required",
    "statusCode": 400
  }
}
```

### Error Response (409 - Conflict)

```json
{
  "error": {
    "message": "Plate number already exists",
    "statusCode": 409
  }
}
```

---

## Update Driver

Update an existing driver's information.

### Request

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "vehicleType": "SUV",
    "vehicleModel": "Toyota RAV4",
    "vehicleYear": 2022,
    "vehicleColor": "Red",
    "vehicleCapacity": 5
  }'
```

### Update Profile Only

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "vehicle": "SUV"
  }'
```

### Update Vehicle Info Only

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "SUV",
    "vehicleModel": "Toyota RAV4",
    "vehicleYear": 2022,
    "vehicleColor": "Red",
    "vehicleCapacity": 5
  }'
```

### Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Updated",
  "vehicle": "Sedan",
  "plate": "ABC123",
  "isActive": true,
  "vehicleType": "SUV",
  "vehicleModel": "Toyota RAV4",
  "vehicleYear": 2022,
  "vehicleColor": "Red",
  "vehicleCapacity": 5,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
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
    "message": "Plate number already exists",
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
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/status \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true
  }'
```

### Request (Deactivate Driver)

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/status \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "vehicle": "Sedan",
  "plate": "ABC123",
  "isActive": false,
  "vehicleType": "Car",
  "vehicleModel": "Toyota Camry",
  "vehicleYear": 2020,
  "vehicleColor": "Blue",
  "vehicleCapacity": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
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
    "message": "isActive must be boolean",
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
    "driverId": "507f1f77bcf86cd799439011",
    "action": "CREATED",
    "oldValue": null,
    "newValue": null,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "metadata": null
  },
  {
    "id": "507f1f77bcf86cd799439021",
    "driverId": "507f1f77bcf86cd799439011",
    "action": "STATUS_CHANGED",
    "oldValue": "true",
    "newValue": "false",
    "timestamp": "2024-01-15T11:00:00.000Z",
    "metadata": null
  },
  {
    "id": "507f1f77bcf86cd799439022",
    "driverId": "507f1f77bcf86cd799439011",
    "action": "VEHICLE_UPDATED",
    "oldValue": null,
    "newValue": null,
    "timestamp": "2024-01-15T11:30:00.000Z",
    "metadata": {
      "vehicleType": "SUV",
      "vehicleModel": "Toyota RAV4",
      "vehicleYear": 2022,
      "vehicleColor": "Red",
      "vehicleCapacity": 5
    }
  },
  {
    "id": "507f1f77bcf86cd799439023",
    "driverId": "507f1f77bcf86cd799439011",
    "action": "PROFILE_UPDATED",
    "oldValue": null,
    "newValue": null,
    "timestamp": "2024-01-15T12:00:00.000Z",
    "metadata": {
      "name": "John Updated",
      "vehicle": "SUV",
      "plate": "ABC123"
    }
  }
]
```

### Activity Actions

The following activity actions are tracked:

- `CREATED` - Driver was registered
- `STATUS_CHANGED` - Driver status (active/inactive) was changed
- `PROFILE_UPDATED` - Driver profile (name, vehicle, plate) was updated
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
    "id": "driver1",
    "name": "John Doe",
    "vehicle": "Sedan",
    "plate": "ABC123",
    "vehicleType": "Car",
    "vehicleModel": "Toyota Camry",
    "vehicleYear": 2020,
    "vehicleColor": "Blue",
    "vehicleCapacity": 4
  }'
```

**Save the driver ID from response** (e.g., `507f1f77bcf86cd799439011`)

### 3. Get the Driver

```bash
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011
```

### 4. Update the Driver

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "vehicleType": "SUV"
  }'
```

### 5. Toggle Driver Status

```bash
curl -X PUT http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/status \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### 6. Get Activity History

```bash
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/activity
```

### 7. List All Drivers

```bash
curl -X GET http://localhost:3001/v1/drivers
```

### 8. Delete the Driver

```bash
curl -X DELETE http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011
```

---

## 🔧 Using with Variables

You can use shell variables to make testing easier:

```bash
# Set base URL
BASE_URL="http://localhost:3001"
DRIVER_ID="507f1f77bcf86cd799439011"

# Health check
curl -X GET $BASE_URL/health

# Get driver
curl -X GET $BASE_URL/v1/drivers/$DRIVER_ID

# Update driver
curl -X PUT $BASE_URL/v1/drivers/$DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

---

## 🎨 Pretty Print with jq

For better readability, use `jq` to format JSON responses:

```bash
# Install jq: brew install jq (macOS) or apt-get install jq (Linux)

curl -X GET http://localhost:3001/v1/drivers | jq
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011 | jq
curl -X GET http://localhost:3001/v1/drivers/507f1f77bcf86cd799439011/activity | jq
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
- Driver IDs are MongoDB ObjectIds (24 character hex strings)
- Plate numbers must be unique across all drivers
- The `isActive` field defaults to `true` when creating a new driver
- Activity history is sorted by timestamp (newest first)
- All vehicle fields are optional except for the base `vehicle` field

---

## 🔗 Related Documentation

- [Seeding Script Documentation](./scripts/README.md)
- [CSV Format Documentation](./data/README.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

