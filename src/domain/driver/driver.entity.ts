export class Driver {
  constructor(
    public readonly id: string,
    public name: string,
    public vehicle: string,
    public plate: string,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public vehicleType?: string,
    public vehicleModel?: string,
    public vehicleYear?: number,
    public vehicleColor?: string,
    public vehicleCapacity?: number
  ) {}

  static create(
    id: string,
    name: string,
    vehicle: string,
    plate: string,
    vehicleType?: string,
    vehicleModel?: string,
    vehicleYear?: number,
    vehicleColor?: string,
    vehicleCapacity?: number
  ): Driver {
    const now = new Date();
    return new Driver(
      id,
      name,
      vehicle,
      plate,
      true,
      now,
      now,
      vehicleType,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleCapacity
    );
  }

  setStatus(active: boolean): void {
    this.isActive = active;
    this.updatedAt = new Date();
  }

  updateVehicleInfo(
    vehicleType?: string,
    vehicleModel?: string,
    vehicleYear?: number,
    vehicleColor?: string,
    vehicleCapacity?: number
  ): void {
    if (vehicleType !== undefined) this.vehicleType = vehicleType;
    if (vehicleModel !== undefined) this.vehicleModel = vehicleModel;
    if (vehicleYear !== undefined) this.vehicleYear = vehicleYear;
    if (vehicleColor !== undefined) this.vehicleColor = vehicleColor;
    if (vehicleCapacity !== undefined) this.vehicleCapacity = vehicleCapacity;
    this.updatedAt = new Date();
  }
}
