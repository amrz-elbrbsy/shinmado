export type JobType = 'Survey' | 'Pemasangan' | 'Perbaikan' | 'Lainnya';
export type ScheduleStatus = 'Terjadwal' | 'Berjalan' | 'Selesai' | 'Dibatalkan';
export type TechnicianStatus = 'Aktif' | 'Nonaktif';
export type TargetStatus = 'Berjalan' | 'Selesai' | 'Tertunda';
export type EquipmentStatus = 'Tersedia' | 'Dipinjam' | 'Maintenance' | 'Rusak';
export type EquipmentCondition = 'Baik' | 'Rusak Ringan' | 'Perlu Servis';
export type StockStatus = 'Aman' | 'Menipis' | 'Habis';
export type LoanStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
export type MaintenanceStatus = 'Terjadwal' | 'Dalam Proses' | 'Selesai';
export type NotificationType = 'warning' | 'stock' | 'schedule' | 'maintenance';

export interface Technician {
  id: string; // TKN-001
  name: string;
  phone?: string;
  status: TechnicianStatus;
  activeSchedules?: number;
  currentTargetPercentage?: number;
  joinedDate?: string;
}

export interface Schedule {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: JobType;
  sales?: string; // e.g. "Sales Andi"
  technicianId: string;
  technicianName: string;
  assistantTechnicianName?: string; // e.g. "Teknisi Pendamping Arwan"
  customerName: string;
  setsCount?: number; // for pemasangan e.g. 12 Set
  location: string;
  status: ScheduleStatus;
  notes?: string;
  createdAt?: string;
}

export interface SurveyMeasurement {
  id: string;
  roomName: string;
  widthCm: number;
  heightCm: number;
  fabricType: string;
  mechanism: string;
  notes?: string;
}

export interface SurveyItem {
  id: string;
  customerName: string;
  location: string;
  sales: string;
  technicianId: string;
  technicianName: string;
  assistantTechnicianName?: string;
  date: string;
  time: string;
  status: ScheduleStatus;
  measurements?: SurveyMeasurement[];
  notes?: string;
  hasDocumentation?: boolean;
}

export interface InstallationDailyProgress {
  dayNumber: number;
  date: string;
  setsInstalled: number;
  technicianName?: string;
  notes?: string;
}

export interface Installation {
  id: string;
  projectName: string;
  customerName: string;
  location: string;
  technicianId: string;
  technicianName: string;
  assistantTechnicianName?: string;
  teamMembers?: string[];
  startDate: string;
  endDate?: string;
  totalSets: number;
  completedSets: number;
  progressPercentage: number;
  status: TargetStatus | 'Dalam Proses' | 'Terjadwal';
  dailyProgress?: InstallationDailyProgress[];
  notes?: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
  details?: string;
}

export interface Target {
  id: string;
  technicianId: string;
  technicianName: string;
  periodStart: string; // e.g. "2026-09-18"
  periodEnd: string; // e.g. "2026-09-20"
  targetSets: number;
  actualSets: number;
  progressPercentage: number;
  status: TargetStatus;
  daysRemaining?: number;
}

export interface Equipment {
  id: string;
  code?: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  serialNumber?: string;
  currentBorrower?: string;
  currentBorrowerId?: string;
  lastMaintained?: string;
  notes?: string;
}

export interface EquipmentLoan {
  id: string; // e.g. "L-001"
  equipmentId: string;
  equipmentCode?: string;
  equipmentName: string;
  borrowerName: string;
  technicianId: string;
  borrowDate: string;
  estimatedReturnDate: string;
  actualReturnDate?: string | null;
  status: LoanStatus;
  returnCondition?: EquipmentCondition;
  notes?: string;
}

export interface Material {
  id: string;
  code?: string;
  name: string;
  category: string;
  stock: number;
  unit: string; // Meter, Batang, Pcs, Unit
  minStock: number;
  status: StockStatus;
  notes?: string;
  lastRestocked?: string;
}

export interface MaintenanceRecord {
  id: string; // e.g. "M-001"
  equipmentId: string;
  equipmentCode?: string;
  equipmentName: string;
  maintenanceType: string;
  scheduledDate: string;
  cost: number; // in IDR
  status: MaintenanceStatus;
  technicianInCharge?: string;
  notes?: string;
}

export interface DocumentationItem {
  id: string;
  title: string;
  type?: JobType;
  technicianName: string;
  technicianId?: string;
  location?: string;
  date: string;
  imageUrl: string;
  description: string;
  setsCount?: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  read: boolean;
  linkPage: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
}

export interface SystemSettings {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  scheduleReminders: boolean;
  stockAlerts: boolean;
  whatsappNumber: string;
  whatsappConnected: boolean;
  googleSheetsConnected: boolean;
  googleSheetsLastSync?: string;
  timezone: string;
  dateFormat: string;
  displayDensity: 'comfortable' | 'compact';
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
