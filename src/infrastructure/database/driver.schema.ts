import mongoose, { Schema, Document, Types } from 'mongoose';

export interface DriverDocument extends Document {
  _id: string;
  driver_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_plate: string;
  plate?: string;
  is_active: boolean;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_capacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<DriverDocument>(
  {
    _id: {
      type: String,
      required: true,
      default: () => new Types.ObjectId().toString(),
    },
    driver_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    vehicle_type: { type: String, required: true },
    vehicle_plate: { type: String, required: true, unique: true, index: true },
    plate: { type: String, index: true },
    is_active: { type: Boolean, default: true, index: true },
    vehicle_model: { type: String },
    vehicle_year: { type: Number },
    vehicle_color: { type: String },
    vehicle_capacity: { type: Number },
  },
  {
    timestamps: true,
    _id: true,
  }
);

// Create indexes
DriverSchema.index({ driver_id: 1 }, { unique: true });
DriverSchema.index({ vehicle_plate: 1 }, { unique: true });
DriverSchema.index({ is_active: 1 });
DriverSchema.index({ phone: 1 });

DriverSchema.pre('validate', function syncPlateField(next) {
  if (this.vehicle_plate && !this.plate) {
    this.plate = this.vehicle_plate;
  }

  if (!this.vehicle_plate && this.plate) {
    this.vehicle_plate = this.plate;
  }

  next();
});

// Allow overriding the MongoDB collection name via env var DRIVER_COLLECTION
const driverCollectionName = process.env.DRIVER_COLLECTION || 'drivers';
export const DriverModel = mongoose.model<DriverDocument>('Driver', DriverSchema, driverCollectionName);

