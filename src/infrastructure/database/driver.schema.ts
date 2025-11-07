import mongoose, { Schema, Document, Types } from 'mongoose';

export interface DriverDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  vehicle: string;
  plate: string;
  isActive: boolean;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehicleCapacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema(
  {
    name: { type: String, required: true },
    vehicle: { type: String, required: true },
    plate: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    vehicleType: { type: String },
    vehicleModel: { type: String },
    vehicleYear: { type: Number },
    vehicleColor: { type: String },
    vehicleCapacity: { type: Number },
  },
  {
    timestamps: true,
    _id: true,
  }
);

// Create indexes
DriverSchema.index({ plate: 1 }, { unique: true });
DriverSchema.index({ isActive: 1 });

// Allow overriding the MongoDB collection name via env var DRIVER_COLLECTION
const driverCollectionName = process.env.DRIVER_COLLECTION || 'drivers';
export const DriverModel = mongoose.model<DriverDocument>('Driver', DriverSchema, driverCollectionName);

