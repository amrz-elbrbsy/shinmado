import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Technician,
  Schedule,
  Target,
  Equipment,
  EquipmentLoan,
  Material,
  MaintenanceRecord,
  DocumentationItem,
  NotificationItem,
  AdminUser,
  SystemSettings,
  ToastMessage,
  EquipmentCondition,
  LoanStatus,
  SurveyItem,
  Installation,
  ActivityLog,
} from '../types';
import {
  initialTechnicians,
  initialSchedules,
  initialTargets,
  initialEquipment,
  initialLoans,
  initialMaterials,
  initialMaintenance,
  initialDocumentation,
  initialNotifications,
  initialAdminProfile,
  initialSystemSettings,
  initialSurveys,
  initialInstallations,
} from '../data/initialData';
import {
  supabase,
  checkSupabaseConnection,
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  SupabaseConfig,
} from '../lib/supabase';

export type PageId =
  | 'dashboard'
  | 'survey'
  | 'pemasangan'
  | 'teknisi'
  | 'jadwal'
  | 'target'
  | 'peralatan'
  | 'peminjaman'
  | 'material'
  | 'maintenance'
  | 'laporan'
  | 'dokumentasi'
  | 'notifikasi'
  | 'pengaturan';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: AdminUser;
  activePage: PageId;
  navigate: (page: PageId) => void;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (data: Partial<AdminUser>) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Technicians
  technicians: Technician[];
  addTechnician: (tech: Omit<Technician, 'id' | 'activeSchedules' | 'currentTargetPercentage'>) => void;
  updateTechnician: (id: string, data: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;

  // Schedules
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;

  // Surveys (Dedicated Section Q)
  surveys: SurveyItem[];
  addSurvey: (survey: Omit<SurveyItem, 'id'>) => void;
  updateSurvey: (id: string, data: Partial<SurveyItem>) => void;
  deleteSurvey: (id: string) => void;

  // Installations (Dedicated Section R - Supports Multi-day)
  installations: Installation[];
  addInstallation: (inst: Omit<Installation, 'id'>) => void;
  updateInstallation: (id: string, data: Partial<Installation>) => void;
  deleteInstallation: (id: string) => void;
  logInstallationDay: (installationId: string, dayNumber: number, setsInstalled: number, notes?: string) => void;

  // Targets
  targets: Target[];
  addTarget: (target: Omit<Target, 'id' | 'progressPercentage' | 'daysRemaining'>) => void;
  updateTarget: (id: string, data: Partial<Target>) => void;
  deleteTarget: (id: string) => void;

  // Equipment
  equipment: Equipment[];
  addEquipment: (eq: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Loans
  loans: EquipmentLoan[];
  addLoan: (loan: Omit<EquipmentLoan, 'id'>) => void;
  updateLoan: (id: string, data: Partial<EquipmentLoan>) => void;
  deleteLoan: (id: string) => void;
  returnLoan: (
    loanId: string,
    returnDateOrCondition: string | EquipmentCondition,
    condition?: EquipmentCondition,
    notes?: string
  ) => void;

  // Materials
  materials: Material[];
  addMaterial: (mat: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Maintenance
  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (item: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: string, data: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;

  // Documentation
  documentations: DocumentationItem[];
  addDocumentation: (item: Omit<DocumentationItem, 'id'>) => void;
  deleteDocumentation: (id: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (data: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;

  // Supabase Backend Status & Configuration
  supabaseStatus: {
    isConnected: boolean;
    message: string;
    latencyMs?: number;
  };
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  refreshSupabaseConnection: () => Promise<void>;

  // Global search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'ziplind_shinmado_';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load ' + key, err);
  }
  return fallback;
}

function saveStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save ' + key, err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadStored<boolean>('auth', true)
  );
  const [currentUser, setCurrentUser] = useState<AdminUser>(() =>
    loadStored<AdminUser>('user', initialAdminProfile)
  );
  const [activePage, setActivePage] = useState<PageId>(() =>
    loadStored<PageId>('page', 'dashboard')
  );
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [technicians, setTechnicians] = useState<Technician[]>(() =>
    loadStored<Technician[]>('technicians', initialTechnicians)
  );
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadStored<Schedule[]>('schedules', initialSchedules)
  );
  const [surveys, setSurveys] = useState<SurveyItem[]>(() =>
    loadStored<SurveyItem[]>('surveys', initialSurveys)
  );
  const [installations, setInstallations] = useState<Installation[]>(() =>
    loadStored<Installation[]>('installations', initialInstallations)
  );
  const [targets, setTargets] = useState<Target[]>(() =>
    loadStored<Target[]>('targets', initialTargets)
  );
  const [equipment, setEquipment] = useState<Equipment[]>(() =>
    loadStored<Equipment[]>('equipment', initialEquipment)
  );
  const [loans, setLoans] = useState<EquipmentLoan[]>(() =>
    loadStored<EquipmentLoan[]>('loans', initialLoans)
  );
  const [materials, setMaterials] = useState<Material[]>(() =>
    loadStored<Material[]>('materials', initialMaterials)
  );
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() =>
    loadStored<MaintenanceRecord[]>('maintenance', initialMaintenance)
  );
  const [documentations, setDocumentations] = useState<DocumentationItem[]>(() =>
    loadStored<DocumentationItem[]>('documentation', initialDocumentation)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStored<NotificationItem[]>('notifications', initialNotifications)
  );
  const [settings, setSettings] = useState<SystemSettings>(() =>
    loadStored<SystemSettings>('settings', initialSystemSettings)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase status
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean;
    message: string;
    latencyMs?: number;
  }>({
    isConnected: false,
    message: 'Menguji koneksi Supabase...',
  });

  // Check Supabase connection on startup
  const refreshSupabaseConnection = async () => {
    try {
      const res = await checkSupabaseConnection();
      setSupabaseStatus({
        isConnected: Boolean(res.isConnected ?? res.connected),
        message: res.message,
        latencyMs: res.latencyMs,
      });
    } catch (e: any) {
      setSupabaseStatus({
        isConnected: false,
        message: e?.message || 'Gagal tersambung ke Supabase',
      });
    }
  };

  useEffect(() => {
    refreshSupabaseConnection();

    // Setup Supabase Realtime Listener
    try {
      const channel = supabase
        .channel('ziplind_realtime_broadcast')
        .on('broadcast', { event: 'ziplind_update' }, (payload) => {
          console.log('Supabase Broadcast Update:', payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      // safe fallback
    }
  }, []);

  const updateSupabaseConfig = async (url: string, key: string): Promise<boolean> => {
    saveStoredSupabaseConfig(url, key);
    const updated = getStoredSupabaseConfig();
    setSupabaseConfig(updated);
    const check = await checkSupabaseConnection();
    setSupabaseStatus({
      isConnected: Boolean(check.isConnected ?? check.connected),
      message: check.message,
      latencyMs: check.latencyMs,
    });
    if (check.connected || check.isConnected) {
      showToast('Tersambung ke Supabase', check.message, 'success');
    } else {
      showToast('Koneksi Supabase Disimpan', 'Mode Cloud Sync aktif dengan offline buffer.', 'info');
    }
    return check.connected;
  };

  // Sync to local storage
  useEffect(() => saveStored('auth', isAuthenticated), [isAuthenticated]);
  useEffect(() => saveStored('user', currentUser), [currentUser]);
  useEffect(() => saveStored('page', activePage), [activePage]);
  useEffect(() => saveStored('technicians', technicians), [technicians]);
  useEffect(() => saveStored('schedules', schedules), [schedules]);
  useEffect(() => saveStored('surveys', surveys), [surveys]);
  useEffect(() => saveStored('installations', installations), [installations]);
  useEffect(() => saveStored('targets', targets), [targets]);
  useEffect(() => saveStored('equipment', equipment), [equipment]);
  useEffect(() => saveStored('loans', loans), [loans]);
  useEffect(() => saveStored('materials', materials), [materials]);
  useEffect(() => saveStored('maintenance', maintenanceRecords), [maintenanceRecords]);
  useEffect(() => saveStored('documentation', documentations), [documentations]);
  useEffect(() => saveStored('notifications', notifications), [notifications]);
  useEffect(() => saveStored('settings', settings), [settings]);

  const navigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (email.trim() && pass.trim()) {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'ADM-01',
        name: 'Muhammad Amrizal',
        email,
        role: 'Administrator',
      });
      showToast('Login Berhasil', 'Selamat datang di ZIPBLIND PT SHINMADO.', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logout Berhasil', 'Sesi Anda telah diakhiri dengan aman.', 'info');
  };

  const updateCurrentUser = (data: Partial<AdminUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  // Notifications
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Semua Notifikasi Telah Dibaca', undefined, 'info');
  };

  // Technicians CRUD
  const addTechnician = (tech: Omit<Technician, 'id' | 'activeSchedules' | 'currentTargetPercentage'>) => {
    const maxNum = technicians.reduce((max, t) => {
      const num = parseInt(t.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `TKN-${String(maxNum + 1).padStart(3, '0')}`;
    const newTech: Technician = {
      ...tech,
      id: newId,
      activeSchedules: 0,
      currentTargetPercentage: 0,
    };
    setTechnicians((prev) => [newTech, ...prev]);
    showToast('Teknisi Berhasil Ditambahkan', `${newTech.name} (${newTech.id}) telah aktif.`, 'success');
  };

  const updateTechnician = (id: string, data: Partial<Technician>) => {
    setTechnicians((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    showToast('Data Teknisi Diperbarui', undefined, 'success');
  };

  const deleteTechnician = (id: string) => {
    const tech = technicians.find((t) => t.id === id);
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    showToast('Teknisi Dihapus', `${tech?.name || id} telah dihapus dari daftar.`, 'info');
  };

  // Schedules CRUD
  const addSchedule = (scheduleData: Omit<Schedule, 'id'>) => {
    const maxNum = schedules.reduce((max, s) => {
      const num = parseInt(s.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `SCH-${String(maxNum + 1).padStart(3, '0')}`;
    const newSchedule: Schedule = {
      ...scheduleData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    showToast('Jadwal Berhasil Ditambahkan', `${newSchedule.type} - ${newSchedule.customerName}`, 'success');
  };

  const updateSchedule = (id: string, data: Partial<Schedule>) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    showToast('Jadwal Diperbarui', undefined, 'success');
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast('Jadwal Dihapus', undefined, 'info');
  };

  // Surveys CRUD
  const addSurvey = (surveyData: Omit<SurveyItem, 'id'>) => {
    const maxNum = surveys.reduce((max, s) => {
      const num = parseInt(s.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `SRV-${String(maxNum + 1).padStart(3, '0')}`;
    const newSurvey: SurveyItem = {
      ...surveyData,
      id: newId,
      measurements: surveyData.measurements || [],
    };
    setSurveys((prev) => [newSurvey, ...prev]);
    showToast('Survey Ditambahkan', `${newSurvey.customerName} (${newSurvey.time})`, 'success');
  };

  const updateSurvey = (id: string, data: Partial<SurveyItem>) => {
    setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    showToast('Data Survey Diperbarui', undefined, 'success');
  };

  const deleteSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    showToast('Survey Dihapus', undefined, 'info');
  };

  // Installations CRUD (Multi-day support)
  const addInstallation = (instData: Omit<Installation, 'id'>) => {
    const maxNum = installations.reduce((max, i) => {
      const num = parseInt(i.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `INS-${String(maxNum + 1).padStart(3, '0')}`;
    const pct = Math.round((instData.completedSets / (instData.totalSets || 1)) * 100);
    const newInst: Installation = {
      ...instData,
      id: newId,
      progressPercentage: pct,
      dailyProgress: instData.dailyProgress || [],
    };
    setInstallations((prev) => [newInst, ...prev]);
    showToast('Pemasangan Terjadwal', `${newInst.projectName} (${newInst.totalSets} Set)`, 'success');
  };

  const updateInstallation = (id: string, data: Partial<Installation>) => {
    setInstallations((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const updated = { ...inst, ...data };
          const pct = Math.min(100, Math.round((updated.completedSets / (updated.totalSets || 1)) * 100));
          return { ...updated, progressPercentage: pct };
        }
        return inst;
      })
    );
    showToast('Pemasangan Diperbarui', undefined, 'success');
  };

  const deleteInstallation = (id: string) => {
    setInstallations((prev) => prev.filter((i) => i.id !== id));
    showToast('Pemasangan Dihapus', undefined, 'info');
  };

  const logInstallationDay = (
    installationId: string,
    dayNumber: number,
    setsInstalled: number,
    notes?: string
  ) => {
    setInstallations((prev) =>
      prev.map((inst) => {
        if (inst.id === installationId) {
          const newCompleted = inst.completedSets + setsInstalled;
          const newPct = Math.min(100, Math.round((newCompleted / (inst.totalSets || 1)) * 100));
          const newStatus = newPct >= 100 ? 'Selesai' : 'Dalam Proses';
          const newLog = {
            dayNumber,
            date: new Date().toISOString().split('T')[0],
            setsInstalled,
            technicianName: inst.technicianName,
            notes,
          };
          return {
            ...inst,
            completedSets: newCompleted,
            progressPercentage: newPct,
            status: newStatus,
            dailyProgress: [...(inst.dailyProgress || []), newLog],
          };
        }
        return inst;
      })
    );
    showToast('Progres Harian Dicatat', `+${setsInstalled} Set berhasil diverifikasi.`, 'success');
  };

  // Targets CRUD
  const addTarget = (targetData: Omit<Target, 'id' | 'progressPercentage' | 'daysRemaining'>) => {
    const maxNum = targets.reduce((max, t) => {
      const num = parseInt(t.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `TGT-${String(maxNum + 1).padStart(3, '0')}`;
    const pct = Math.round((targetData.actualSets / (targetData.targetSets || 1)) * 100);
    const newTarget: Target = {
      ...targetData,
      id: newId,
      progressPercentage: pct,
      daysRemaining: 3,
    };
    setTargets((prev) => [newTarget, ...prev]);
    showToast('Target Teknisi Ditambahkan', `${newTarget.technicianName} - ${newTarget.targetSets} Set`, 'success');
  };

  const updateTarget = (id: string, data: Partial<Target>) => {
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...data };
          const pct = Math.round((updated.actualSets / (updated.targetSets || 1)) * 100);
          return { ...updated, progressPercentage: pct };
        }
        return t;
      })
    );
    showToast('Target Diperbarui', undefined, 'success');
  };

  const deleteTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    showToast('Target Dihapus', undefined, 'info');
  };

  // Equipment CRUD
  const addEquipment = (eqData: Omit<Equipment, 'id'>) => {
    const maxNum = equipment.reduce((max, e) => {
      const num = parseInt(e.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `EQ-${String(maxNum + 1).padStart(3, '0')}`;
    const newEq: Equipment = {
      ...eqData,
      id: newId,
    };
    setEquipment((prev) => [newEq, ...prev]);
    showToast('Alat Berhasil Ditambahkan', `${newEq.name} (${newEq.id})`, 'success');
  };

  const updateEquipment = (id: string, data: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    showToast('Data Alat Diperbarui', undefined, 'success');
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
    showToast('Alat Dihapus', undefined, 'info');
  };

  // Loans CRUD
  const addLoan = (loanData: Omit<EquipmentLoan, 'id'>) => {
    const maxNum = loans.reduce((max, l) => {
      const num = parseInt(l.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `L-${String(maxNum + 1).padStart(3, '0')}`;
    const newLoan: EquipmentLoan = {
      ...loanData,
      id: newId,
    };
    setLoans((prev) => [newLoan, ...prev]);

    // Update equipment status
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === loanData.equipmentId
          ? {
              ...e,
              status: 'Dipinjam',
              currentBorrower: loanData.borrowerName,
              currentBorrowerId: loanData.technicianId,
            }
          : e
      )
    );

    showToast('Peminjaman Dicatat', `${newLoan.equipmentName} untuk ${newLoan.borrowerName}`, 'success');
  };

  const updateLoan = (id: string, data: Partial<EquipmentLoan>) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    showToast('Data Peminjaman Diperbarui', undefined, 'success');
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    showToast('Catatan Peminjaman Dihapus', undefined, 'info');
  };

  const returnLoan = (
    loanId: string,
    returnDateOrCondition: string | EquipmentCondition,
    conditionArg?: EquipmentCondition,
    notes?: string
  ) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    let actualDate = '2026-09-20';
    let finalCondition: EquipmentCondition = 'Baik';

    if (
      returnDateOrCondition === 'Baik' ||
      returnDateOrCondition === 'Rusak Ringan' ||
      returnDateOrCondition === 'Perlu Servis'
    ) {
      finalCondition = returnDateOrCondition;
    } else {
      actualDate = returnDateOrCondition || '2026-09-20';
      finalCondition = conditionArg || 'Baik';
    }

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'Dikembalikan',
              actualReturnDate: actualDate,
              returnCondition: finalCondition,
              notes: notes || l.notes,
            }
          : l
      )
    );

    // Update equipment status
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === loan.equipmentId
          ? {
              ...e,
              status: finalCondition === 'Perlu Servis' ? 'Maintenance' : 'Tersedia',
              condition: finalCondition,
              currentBorrower: undefined,
              currentBorrowerId: undefined,
            }
          : e
      )
    );

    showToast(
      'Pengembalian Berhasil',
      `${loan.equipmentName} telah dikembalikan (${finalCondition}).`,
      'success'
    );
  };

  // Materials CRUD
  const addMaterial = (matData: Omit<Material, 'id'>) => {
    const maxNum = materials.reduce((max, m) => {
      const num = parseInt(m.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `MAT-${String(maxNum + 1).padStart(3, '0')}`;
    const newMat: Material = {
      ...matData,
      id: newId,
    };
    setMaterials((prev) => [newMat, ...prev]);
    showToast('Material Ditambahkan', `${newMat.name} (${newMat.stock} ${newMat.unit})`, 'success');
  };

  const updateMaterial = (id: string, data: Partial<Material>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    showToast('Material Diperbarui', undefined, 'success');
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Material Dihapus', undefined, 'info');
  };

  // Maintenance CRUD
  const addMaintenanceRecord = (recData: Omit<MaintenanceRecord, 'id'>) => {
    const maxNum = maintenanceRecords.reduce((max, m) => {
      const num = parseInt(m.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `M-${String(maxNum + 1).padStart(3, '0')}`;
    const newRec: MaintenanceRecord = {
      ...recData,
      id: newId,
    };
    setMaintenanceRecords((prev) => [newRec, ...prev]);
    showToast('Jadwal Maintenance Ditambahkan', `${newRec.equipmentName} - ${newRec.maintenanceType}`, 'success');
  };

  const updateMaintenanceRecord = (id: string, data: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    showToast('Catatan Maintenance Diperbarui', undefined, 'success');
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords((prev) => prev.filter((m) => m.id !== id));
    showToast('Catatan Maintenance Dihapus', undefined, 'info');
  };

  // Documentation CRUD
  const addDocumentation = (docData: Omit<DocumentationItem, 'id'>) => {
    const maxNum = documentations.reduce((max, d) => {
      const num = parseInt(d.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = `DOC-${String(maxNum + 1).padStart(3, '0')}`;
    const newDoc: DocumentationItem = {
      ...docData,
      id: newId,
    };
    setDocumentations((prev) => [newDoc, ...prev]);
    showToast('Dokumentasi Disimpan', `${newDoc.title}`, 'success');
  };

  const deleteDocumentation = (id: string) => {
    setDocumentations((prev) => prev.filter((d) => d.id !== id));
    showToast('Dokumentasi Dihapus', undefined, 'info');
  };

  const updateSettings = (data: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
    showToast('Pengaturan Tersimpan', undefined, 'success');
  };

  const resetToDefaultData = () => {
    setTechnicians(initialTechnicians);
    setSchedules(initialSchedules);
    setSurveys(initialSurveys);
    setInstallations(initialInstallations);
    setTargets(initialTargets);
    setEquipment(initialEquipment);
    setLoans(initialLoans);
    setMaterials(initialMaterials);
    setMaintenanceRecords(initialMaintenance);
    setDocumentations(initialDocumentation);
    setNotifications(initialNotifications);
    setSettings(initialSystemSettings);
    showToast('Data Di-reset ke Default', 'Semua data operasional telah dikembalikan ke data awal.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        activePage,
        navigate,
        login,
        logout,
        updateCurrentUser,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        technicians,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        surveys,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        installations,
        addInstallation,
        updateInstallation,
        deleteInstallation,
        logInstallationDay,
        targets,
        addTarget,
        updateTarget,
        deleteTarget,
        equipment,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        returnLoan,
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        maintenanceRecords,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        documentations,
        addDocumentation,
        deleteDocumentation,
        settings,
        updateSettings,
        resetToDefaultData,
        supabaseStatus,
        supabaseConfig,
        updateSupabaseConfig,
        refreshSupabaseConnection,
        globalSearchQuery,
        setGlobalSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
