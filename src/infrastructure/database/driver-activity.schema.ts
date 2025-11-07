import mongoose, { Schema, Document, Types } from 'mongoose';
import { DriverActivityAction } from '../../domain/driver/driver-activity.entity';

export interface DriverActivityDocument extends Document {
  _id: Types.ObjectId;
  driverId: string;
  action: DriverActivityAction;
  oldValue: string | null;
  newValue: string | null;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const DriverActivitySchema = new Schema(
  {
    driverId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: Object.values(DriverActivityAction),
      required: true,
      index: true,
    },
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    _id: true,
  }
);

// Create indexes
DriverActivitySchema.index({ driverId: 1, timestamp: -1 });
DriverActivitySchema.index({ action: 1 });
DriverActivitySchema.index({ timestamp: -1 });

// Allow overriding the MongoDB collection name via env var
const activityCollectionName = process.env.DRIVER_ACTIVITY_COLLECTION || 'driver_activities';
export const DriverActivityModel = mongoose.model<DriverActivityDocument>(
  'DriverActivity',
  DriverActivitySchema,
  activityCollectionName
);

