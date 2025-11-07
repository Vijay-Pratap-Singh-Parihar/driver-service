export enum DriverActivityAction {
  CREATED = 'CREATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  VEHICLE_UPDATED = 'VEHICLE_UPDATED',
  DELETED = 'DELETED',
}

export class DriverActivity {
  constructor(
    public readonly id: string | undefined,
    public readonly driverId: string,
    public readonly action: DriverActivityAction,
    public readonly oldValue: string | null,
    public readonly newValue: string | null,
    public readonly timestamp: Date,
    public readonly metadata?: Record<string, any>
  ) {}

  static create(
    driverId: string,
    action: DriverActivityAction,
    oldValue: string | null = null,
    newValue: string | null = null,
    metadata?: Record<string, any>
  ): DriverActivity {
    return new DriverActivity(undefined, driverId, action, oldValue, newValue, new Date(), metadata);
  }
}

