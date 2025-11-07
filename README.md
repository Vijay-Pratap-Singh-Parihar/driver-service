# Driver Service Setup Guide

## Service Overview
- Manages the lifecycle of drivers (registration, updates, activation, deletion) for the Ride Fleeting platform.
- Persists driver profiles and activity records in MongoDB to keep an auditable history of status changes.
- Publishes domain events (e.g. newly registered drivers, status toggles) to Kafka so downstream services stay synced.
- Exposes REST endpoints under `/v1/drivers`, a `/metrics` endpoint for Prometheus scrapes, and structured JSON logs with request correlation IDs.

## How It Works
- `Express` hosts the HTTP API and applies middleware for rate limiting, request correlation, and uniform error handling.
- Use-case classes under `src/application` encapsulate business rules and invoke repositories plus the Kafka event publisher.
- MongoDB repositories map domain entities to the `drivers` and `driver_activities` collections.
- Kafka producer settings (topics, partitions, broker list) live in `src/infrastructure/messaging`; every write operation emits the relevant driver event.

## Local Setup
1. **Node.js**: install and use Node.js `v22.x` (paired npm `v10+`). With `nvm`:
   ```bash
   nvm install 22
   nvm use 22
   ```
2. **Install dependencies**:
   ```bash
   cd driver-service
   npm install
   ```
3. **Environment variables**: create a `.env` (or configure your shell) with the following keys:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `PORT` | optional (`3001` default) | HTTP port for the service. |
   | `MONGODB_URI` | **yes** | MongoDB connection string (e.g. `mongodb://localhost:27018`). |
   | `MONGODB_DB_NAME` | optional (`driver-service`) | Database name. |
   | `KAFKA_BROKERS` | **yes** | Comma-separated list of Kafka brokers (e.g. `localhost:9092`). |
   | `KAFKA_CLIENT_ID` | optional (`driver-service`) | Kafka client id used by the producer. |
   | `KAFKA_TOPIC_DRIVER_EVENTS` | optional (`driver-events`) | Topic for general driver domain events. |
   | `KAFKA_TOPIC_DRIVER_NOTIFICATIONS` | optional (`driver-notifications`) | Topic for notification-related driver events. |
   | `KAFKA_DRIVER_EVENTS_PARTITIONS` | optional (`3`) | Partition count hint when auto-creating the driver events topic. |
   | `KAFKA_DRIVER_NOTIFICATIONS_PARTITIONS` | optional (`3`) | Partition count hint when auto-creating the driver notifications topic. |

   Additional collection names (e.g. `DRIVER_COLLECTION`) can be provided to override defaults when running under Docker.

4. **Start dependencies**: ensure MongoDB and Kafka are reachable. For local Docker you can run from the repo root:
   ```bash
   docker compose up -d mongodb-driver kafka zookeeper
   ```

5. **Run the service**:
   - Development (TypeScript with reload): `npm run dev`
   - Production build: `npm run build && npm start`

6. **Seed sample drivers (optional)**: once the service is running and MongoDB is reachable you can load fixture data via `npm run seed:drivers`.

## Useful Endpoints
- `GET /health` – Liveness probe.
- `GET /v1/drivers` – List all drivers.
- `GET /v1/drivers/active` – List active drivers.
- `POST /v1/drivers` – Register a driver (emits Kafka events, records activity).
- `GET /metrics` – Prometheus-formatted service metrics.

For endpoint payloads and response schemas refer to `API.md` and `CURL_EXAMPLES.md`.

## Running with Docker Compose
- The repository root `docker-compose.yml` already declares the `driver-service`. From the project root run:
  ```bash
  docker compose up driver-service
  ```
- This will build the image, start MongoDB/Kafka (via declared dependencies), and expose the service on port `3001`.

## Troubleshooting
- **Mongo errors**: confirm `MONGODB_URI` points to a live instance and that the user has permission to create/use the `driver-service` database.
- **Kafka connection failures**: verify the broker list, ensure the Kafka container is healthy, and that ports `9092/9093` are not blocked.
- **Metrics or event lag**: check the service logs (structured JSON) for correlation ids and Kafka publish errors.

