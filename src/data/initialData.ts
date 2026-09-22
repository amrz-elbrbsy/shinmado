import {
  AdminUser,
  DocumentationItem,
  Equipment,
  EquipmentLoan,
  Installation,
  MaintenanceRecord,
  Material,
  NotificationItem,
  Schedule,
  SurveyItem,
  SystemSettings,
  Target,
  Technician,
} from '../types';

// Empty fallbacks keep the application database-driven without seeding demo records.
export const initialTechnicians: Technician[] = [];
export const initialSchedules: Schedule[] = [];
export const initialTargets: Target[] = [];
export const initialEquipment: Equipment[] = [];
export const initialLoans: EquipmentLoan[] = [];
export const initialMaterials: Material[] = [];
export const initialMaintenance: MaintenanceRecord[] = [];
export const initialDocumentation: DocumentationItem[] = [];
export const initialNotifications: NotificationItem[] = [];
export const initialSurveys: SurveyItem[] = [];
export const initialInstallations: Installation[] = [];

export const initialAdminProfile: AdminUser = {
  id: 'ADM-01',
  name: 'Muhammad Amrizal',
  email: 'mamrizal953@gmail.com',
  role: 'Administrator',
  avatarUrl: '',
};

export const initialSystemSettings: SystemSettings = {
  emailNotifications: true,
  whatsappNotifications: true,
  scheduleReminders: true,
  stockAlerts: true,
  whatsappNumber: '+62 812-8871-9999',
  whatsappConnected: true,
  googleSheetsConnected: false,
  timezone: 'Asia/Jakarta (WIB)',
  dateFormat: 'DD/MM/YYYY',
  displayDensity: 'comfortable',
};
