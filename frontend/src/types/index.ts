export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  BUS = 'BUS',
  TRAILER = 'TRAILER',
}

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AlertType {
  SPEED_VIOLATION = 'SPEED_VIOLATION',
  GEOFENCE_BREACH = 'GEOFENCE_BREACH',
  LOW_FUEL = 'LOW_FUEL',
  ENGINE_OVERHEAT = 'ENGINE_OVERHEAT',
  HARSH_BRAKING = 'HARSH_BRAKING',
  VEHICLE_OFFLINE = 'VEHICLE_OFFLINE',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
  BATTERY_LOW = 'BATTERY_LOW',
  ACCIDENT = 'ACCIDENT',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_ROTATION = 'TIRE_ROTATION',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  INSPECTION = 'INSPECTION',
  MAJOR_SERVICE = 'MAJOR_SERVICE',
  REPAIR = 'REPAIR',
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'VIEWER';
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  speed?: number;
  heading?: number;
  altitude?: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  avatarUrl?: string;
  totalTrips: number;
  totalKm: number;
  rating: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: VehicleType;
  status: VehicleStatus;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  fuelLevel: number;
  mileage: number;
  engineTemperature?: number;
  batteryVoltage?: number;
  speed?: number;
  location?: GeoLocation;
  driverId?: string;
  driverName?: string;
  lastUpdate: string;
  groupId?: string;
  groupName?: string;
  imei?: string;
  simCardNumber?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
}

export interface Telemetry {
  id?: string;
  vehicleId: string;
  timestamp: string;
  speed: number;
  fuelLevel: number;
  engineTemperature: number;
  batteryVoltage: number;
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  odometer: number;
  rpm?: number;
  ignitionOn: boolean;
  engineOn: boolean;
  harshBraking: boolean;
  harshAcceleration: boolean;
  signalStrength?: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  licensePlate?: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  mileageAtService?: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  technicianName?: string;
  shopName?: string;
  notes?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  licensePlate?: string;
  driverName?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: string;
  location?: GeoLocation;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface GeoFence {
  id: string;
  name: string;
  type: 'CIRCLE' | 'POLYGON';
  coordinates: Array<{ lat: number; lng: number }>;
  radius?: number;
  active: boolean;
  vehicleIds: string[];
  color: string;
}

export interface DashboardSummary {
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  maintenanceVehicles: number;
  offlineVehicles: number;
  totalAlerts: number;
  criticalAlerts: number;
  maintenanceDueCount: number;
  totalDrivers: number;
  activeDrivers: number;
  fleetActivity: Array<{ hour: string; active: number; idle: number }>;
  fuelConsumers: Array<{ vehicleId: string; vehicleName: string; consumption: number }>;
  recentAlerts: Alert[];
}

export interface FleetReport {
  period: { start: string; end: string };
  totalVehicles: number;
  totalDistance: number;
  totalFuelConsumed: number;
  averageSpeed: number;
  totalTrips: number;
  vehicleReports: Array<{
    vehicleId: string;
    vehicleName: string;
    distance: number;
    fuelConsumed: number;
    avgSpeed: number;
    trips: number;
    onlineHours: number;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
