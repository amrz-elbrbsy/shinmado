import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Hammer,
  Target,
  Wrench,
  Boxes,
  SlidersHorizontal,
  FileText,
  Camera,
  Bell,
  Settings,
  LogOut,
  Users,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp, PageId } from '../../context/AppContext';

export interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className = '' }) => {
  const {
    activePage,
    navigate,
    currentUser,
    logout,
    notifications,
    materials,
    supabaseStatus,
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const lowStockCount = materials.filter((m) => m.status === 'Menipis' || m.status === 'Habis').length;

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'survey',
          label: 'Survey',
          icon: <ClipboardList className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'pemasangan',
          label: 'Pemasangan',
          icon: <Hammer className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'target',
          label: 'Target Pekerjaan',
          icon: <Target className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          icon: <SlidersHorizontal className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'teknisi',
          label: 'Data Teknisi',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'jadwal',
          label: 'Kalender Jadwal',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'INVENTORY',
      items: [
        {
          id: 'peralatan',
          label: 'Peralatan',
          icon: <Wrench className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'material',
          label: 'Material',
          icon: <Boxes className="w-4 h-4 shrink-0" />,
          badge: lowStockCount > 0 ? `${lowStockCount}!` : undefined,
        },
      ],
    },
    {
      title: 'REPORTING',
      items: [
        {
          id: 'laporan',
          label: 'Laporan',
          icon: <FileText className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'dokumentasi',
          label: 'Dokumentasi',
          icon: <Camera className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'notifikasi',
          label: 'Notifikasi',
          icon: <Bell className="w-4 h-4 shrink-0" />,
          badge: unreadNotifs > 0 ? unreadNotifs : undefined,
        },
        {
          id: 'pengaturan',
          label: 'Pengaturan',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const handleNavClick = (pageId: PageId) => {
    navigate(pageId);
    if (onItemClick) onItemClick();
  };

  return (
    <aside
      className={`w-[260px] h-full flex flex-col bg-white border-r border-[#E6EDF8] select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="py-5 px-6 border-b border-slate-100 flex flex-col justify-center">
        <BrandLogo size="md" />
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 scrollbar-thin">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h5 className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.title}
            </h5>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] rounded-xl transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF2DF] text-[#8C6207] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-[#B88710]' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                          isActive
                            ? 'bg-[#B88710]/20 text-[#8C6207]'
                            : typeof item.badge === 'string' && item.badge.includes('!')
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Sidebar: Admin Profile, Supabase Status & Logout */}
      <div className="p-3.5 border-t border-slate-100 space-y-2 bg-white">
        {/* Supabase Status Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                supabaseStatus.isConnected ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="font-semibold text-slate-700">Supabase</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            Connected
          </span>
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => navigate('pengaturan')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              MA
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                {currentUser.role}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
        </div>

        {/* Keluar Button */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
