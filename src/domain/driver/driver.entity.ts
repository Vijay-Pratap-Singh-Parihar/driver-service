export interface DriverCreateProps {
  id?: string;
  driverId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  isActive?: boolean;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehicleCapacity?: number;
}

export class Driver {
  constructor(
    public readonly id: string,
    public driverId: string,
    public name: string,
    public phone: string,
    public vehicleType: string,
    public vehiclePlate: string,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public vehicleModel?: string,
    public vehicleYear?: number,
    public vehicleColor?: string,
    public vehicleCapacity?: number
  ) {}

  static create(props: DriverCreateProps): Driver {
    const now = new Date();
    return new Driver(
      props.id ?? props.driverId,
      props.driverId,
      props.name,
      props.phone,
      props.vehicleType,
      props.vehiclePlate,
      props.isActive ?? true,
      now,
      now,
      props.vehicleModel,
      props.vehicleYear,
      props.vehicleColor,
      props.vehicleCapacity
    );
  }

  setStatus(active: boolean): void {
    this.isActive = active;
    this.updatedAt = new Date();
  }

  updateProfile(update: {
    name?: string;
    phone?: string;
    vehicleType?: string;
    vehiclePlate?: string;
  }): void {
    if (update.name !== undefined) this.name = update.name;
    if (update.phone !== undefined) this.phone = update.phone;
    if (update.vehicleType !== undefined) this.vehicleType = update.vehicleType;
    if (update.vehiclePlate !== undefined) this.vehiclePlate = update.vehiclePlate;
    this.updatedAt = new Date();
  }

  updateVehicleInfo(
    vehicleModel?: string,
    vehicleYear?: number,
    vehicleColor?: string,
    vehicleCapacity?: number
  ): void {
    if (vehicleModel !== undefined) this.vehicleModel = vehicleModel;
    if (vehicleYear !== undefined) this.vehicleYear = vehicleYear;
    if (vehicleColor !== undefined) this.vehicleColor = vehicleColor;
    if (vehicleCapacity !== undefined) this.vehicleCapacity = vehicleCapacity;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      driver_id: this.driverId,
      name: this.name,
      phone: this.phone,
      vehicle_type: this.vehicleType,
      vehicle_plate: this.vehiclePlate,
      is_active: this.isActive,
      vehicle_model: this.vehicleModel ?? null,
      vehicle_year: this.vehicleYear ?? null,
      vehicle_color: this.vehicleColor ?? null,
      vehicle_capacity: this.vehicleCapacity ?? null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
