import { DriverActivityRepositoryPort } from '../../domain/driver/driver-activity.repository.port';
import { DriverActivity } from '../../domain/driver/driver-activity.entity';
import { DriverActivityModel, DriverActivityDocument } from '../database/driver-activity.schema';

export class DriverActivityRepositoryMongoDB implements DriverActivityRepositoryPort {
  async save(activity: DriverActivity): Promise<DriverActivity> {
    const activityDoc = {
      driverId: activity.driverId,
      action: activity.action,
      oldValue: activity.oldValue,
      newValue: activity.newValue,
      timestamp: activity.timestamp,
      metadata: activity.metadata,
    };

    const newActivity = new DriverActivityModel(activityDoc);
    const savedActivity = await newActivity.save();
    return this.mapToDomainEntity(savedActivity);
  }

  async findByDriverId(driverId: string): Promise<DriverActivity[]> {
    const activityDocs = await DriverActivityModel.find({ driverId })
      .sort({ timestamp: -1 })
      .exec();
    return activityDocs.map((doc) => this.mapToDomainEntity(doc));
  }

  async findByDriverIdAndAction(driverId: string, action: string): Promise<DriverActivity[]> {
    const activityDocs = await DriverActivityModel.find({ driverId, action })
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
      activityDoc.driverId,
      activityDoc.action,
      activityDoc.oldValue,
      activityDoc.newValue,
      activityDoc.timestamp,
      activityDoc.metadata
    );
  }
}

