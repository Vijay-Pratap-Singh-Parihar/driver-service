import express from 'express';
import { errorHandler } from './presentation/middleware/error-handler';
import { MongoDBConfig } from './infrastructure/database/mongodb.config';
import { DriverRepositoryMongoDB } from './infrastructure/repositories/driver.repository.mongodb';
import { DriverActivityRepositoryMongoDB } from './infrastructure/repositories/driver-activity.repository.mongodb';
import { RegisterDriverUseCase } from './application/driver/usecases/register-driver.usecase';
import { ToggleDriverStatusUseCase } from './application/driver/usecases/toggle-status.usecase';
import { GetAllDriversUseCase } from './application/driver/usecases/get-all-drivers.usecase';
import { GetActiveDriversUseCase } from './application/driver/usecases/get-active-drivers.usecase';
import { GetDriverUseCase } from './application/driver/usecases/get-driver.usecase';
import { UpdateDriverUseCase } from './application/driver/usecases/update-driver.usecase';
import { DeleteDriverUseCase } from './application/driver/usecases/delete-driver.usecase';
import { GetDriverActivityUseCase } from './application/driver/usecases/get-driver-activity.usecase';
import { DriverController } from './presentation/driver/driver.controller';
import { createDriverRoutes } from './presentation/driver/driver.routes';
import { KafkaConfigManager } from './infrastructure/messaging/kafka.config';
import { KafkaEventPublisher } from './infrastructure/messaging/kafka-event-publisher';
import { correlationIdMiddleware } from './presentation/middleware/correlation-id';
import { Logger } from './shared/logging/logger';
import { createMetricsHandler } from './infrastructure/metrics/metrics';
import { createRateLimiter } from './presentation/middleware/rate-limit';
import { seedDriversOnStartup } from './infrastructure/bootstrap/driver-data-seeder';

const app = express();
app.use(express.json());
app.use(correlationIdMiddleware);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', service: 'driver-service' }));

// Initialize MongoDB connection
const mongoConfig = MongoDBConfig.getInstance();

// Initialize Kafka
const kafkaConfig = KafkaConfigManager.getInstance();
const eventPublisher = new KafkaEventPublisher();

// Initialize dependencies
const driverRepository = new DriverRepositoryMongoDB();
const activityRepository = new DriverActivityRepositoryMongoDB();
const registerDriverUseCase = new RegisterDriverUseCase(driverRepository, activityRepository, eventPublisher);
const getDriverUseCase = new GetDriverUseCase(driverRepository);
const updateDriverUseCase = new UpdateDriverUseCase(driverRepository, activityRepository, eventPublisher);
const deleteDriverUseCase = new DeleteDriverUseCase(driverRepository, activityRepository, eventPublisher);
const toggleDriverStatusUseCase = new ToggleDriverStatusUseCase(driverRepository, activityRepository, eventPublisher);
const getAllDriversUseCase = new GetAllDriversUseCase(driverRepository);
const getActiveDriversUseCase = new GetActiveDriversUseCase(driverRepository);
const getDriverActivityUseCase = new GetDriverActivityUseCase(activityRepository, driverRepository);

const driverController = new DriverController(
  registerDriverUseCase,
  toggleDriverStatusUseCase,
  getAllDriversUseCase,
  getActiveDriversUseCase,
  getDriverUseCase,
  updateDriverUseCase,
  deleteDriverUseCase,
  getDriverActivityUseCase
);

// Routes
// Rate limits for critical endpoints
const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 60, keyGenerator: (req) => req.ip || 'unknown' });
app.use('/v1/drivers', (req, res, next) => {
  // apply limiter only to mutating methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return (writeLimiter as any)(req, res, next);
  }
  next();
});
app.use('/v1/drivers', createDriverRoutes(driverController));

// Metrics endpoint
app.get('/metrics', createMetricsHandler(driverRepository));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Start server with MongoDB and Kafka connections
async function startServer() {
  try {
    await mongoConfig.connect();
    await kafkaConfig.connect();
    await seedDriversOnStartup({
      driverRepository,
      activityRepository,
      eventPublisher,
    });
    app.listen(PORT, () => {
      Logger.info(`🚕 Driver Service running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error('Failed to start server', undefined, { error: String(error) });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  await kafkaConfig.disconnect();
  await mongoConfig.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  await kafkaConfig.disconnect();
  await mongoConfig.disconnect();
  process.exit(0);
});

startServer();
