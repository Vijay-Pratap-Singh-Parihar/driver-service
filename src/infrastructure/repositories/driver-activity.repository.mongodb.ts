import { DriverActivityRepositoryPort } from '../../domain/driver/driver-activity.repository.port';
import { DriverActivity } from '../../domain/driver/driver-activity.entity';
import { DriverActivityModel, DriverActivityDocument } from '../database/driver-activity.schema';

export class DriverActivityRepositoryMongoDB implements DriverActivityRepositoryPort {
  async save(activity: DriverActivity): Promise<DriverActivity> {
    const activityDoc = {
      driver_id: activity.driverId,
      action: activity.action,
      old_value: activity.oldValue,
      new_value: activity.newValue,
      timestamp: activity.timestamp,
      metadata: activity.metadata,
    };

    const newActivity = new DriverActivityModel(activityDoc);
    const savedActivity = await newActivity.save();
    return this.mapToDomainEntity(savedActivity);
  }

  async findByDriverId(driverId: string): Promise<DriverActivity[]> {
    const activityDocs = await DriverActivityModel.find({ driver_id: driverId })
      .sort({ timestamp: -1 })
      .exec();
    return activityDocs.map((doc) => this.mapToDomainEntity(doc));
  }

  async findByDriverIdAndAction(driverId: string, action: string): Promise<DriverActivity[]> {
    const activityDocs = await DriverActivityModel.find({ driver_id: driverId, action })
      .sort({ timestamp: -1 })
      .exec();
    return activityDocs.map((doc) => this.mapToDomainEntity(doc));
  }

  private mapToDomainEntity(activityDoc: DriverActivityDocument): DriverActivity {
    const id: string | undefined = (activityDoc as any)?._id
      ? String((activityDoc as any)._id)
      : (activityDoc as any)?.id
        ? String((activityDoc as any).id)
        : undefined;

    if (!id) {
      throw new Error('DriverActivity document missing _id');
    }

    return new DriverActivity(
      id,
      activityDoc.driver_id,
      activityDoc.action,
      activityDoc.old_value,
      activityDoc.new_value,
      activityDoc.timestamp,
      activityDoc.metadata
    );
  }
}

