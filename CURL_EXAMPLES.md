# 🚀 Quick Reference - cURL Examples

Quick copy-paste cURL commands for testing the Driver Service API.

**Base URL**: `http://localhost:3001`

---

## Health Check

```bash
curl -X GET http://localhost:3001/health
```

---

## List All Drivers

```bash
curl -X GET http://localhost:3001/v1/drivers
```

---

## Get Driver by ID

```bash
# Replace DRIVER_ID with actual driver ID
curl -X GET http://localhost:3001/v1/drivers/DRIVER_ID
```

---

## Register New Driver (Minimal)

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

## Register New Driver (Full)

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

---

## Update Driver Profile

```bash
# Replace DRIVER_ID with actual driver ID
curl -X PUT http://localhost:3001/v1/drivers/DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "vehicle": "SUV"
  }'
```

## Update Vehicle Info

```bash
curl -X PUT http://localhost:3001/v1/drivers/DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "SUV",
    "vehicleModel": "Toyota RAV4",
    "vehicleYear": 2022,
    "vehicleColor": "Red",
    "vehicleCapacity": 5
  }'
```

---

## Toggle Driver Status (Activate)

```bash
curl -X PUT http://localhost:3001/v1/drivers/DRIVER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

## Toggle Driver Status (Deactivate)

```bash
curl -X PUT http://localhost:3001/v1/drivers/DRIVER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

---

## Get Driver Activity History

```bash
curl -X GET http://localhost:3001/v1/drivers/DRIVER_ID/activity
```

---

## Delete Driver

```bash
curl -X DELETE http://localhost:3001/v1/drivers/DRIVER_ID
```

---

## Complete Workflow

```bash
# 1. Health check
curl -X GET http://localhost:3001/health

# 2. Register driver
DRIVER_RESPONSE=$(curl -s -X POST http://localhost:3001/v1/drivers \
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
  }')

# Extract driver ID (requires jq)
DRIVER_ID=$(echo $DRIVER_RESPONSE | jq -r '.id')
echo "Driver ID: $DRIVER_ID"

# 3. Get driver
curl -X GET http://localhost:3001/v1/drivers/$DRIVER_ID

# 4. Update driver
curl -X PUT http://localhost:3001/v1/drivers/$DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'

# 5. Toggle status
curl -X PUT http://localhost:3001/v1/drivers/$DRIVER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# 6. Get activity
curl -X GET http://localhost:3001/v1/drivers/$DRIVER_ID/activity

# 7. List all drivers
curl -X GET http://localhost:3001/v1/drivers

# 8. Delete driver
curl -X DELETE http://localhost:3001/v1/drivers/$DRIVER_ID
```

---

## Pretty Print with jq

```bash
# Install jq first: brew install jq (macOS) or apt-get install jq (Linux)

curl -X GET http://localhost:3001/v1/drivers | jq
curl -X GET http://localhost:3001/v1/drivers/DRIVER_ID | jq '.'
curl -X GET http://localhost:3001/v1/drivers/DRIVER_ID/activity | jq '.'
```

---

## Using Variables

```bash
BASE_URL="http://localhost:3001"
DRIVER_ID="507f1f77bcf86cd799439011"

# Get driver
curl -X GET $BASE_URL/v1/drivers/$DRIVER_ID

# Update driver
curl -X PUT $BASE_URL/v1/drivers/$DRIVER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Toggle status
curl -X PUT $BASE_URL/v1/drivers/$DRIVER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'

# Get activity
curl -X GET $BASE_URL/v1/drivers/$DRIVER_ID/activity

# Delete driver
curl -X DELETE $BASE_URL/v1/drivers/$DRIVER_ID
```

---

## Windows PowerShell

For Windows users, here are PowerShell equivalents:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get

# List all drivers
Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers" -Method Get

# Get driver by ID
$driverId = "507f1f77bcf86cd799439011"
Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers/$driverId" -Method Get

# Register driver
$body = @{
    id = "driver1"
    name = "John Doe"
    vehicle = "Sedan"
    plate = "ABC123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers" -Method Post -Body $body -ContentType "application/json"

# Update driver
$updateBody = @{
    name = "John Updated"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers/$driverId" -Method Put -Body $updateBody -ContentType "application/json"

# Toggle status
$statusBody = @{
    isActive = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers/$driverId/status" -Method Put -Body $statusBody -ContentType "application/json"

# Get activity
Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers/$driverId/activity" -Method Get

# Delete driver
Invoke-RestMethod -Uri "http://localhost:3001/v1/drivers/$driverId" -Method Delete
```

---

For detailed API documentation, see [API.md](./API.md)

