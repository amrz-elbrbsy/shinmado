import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  CheckCheck,
  AlertTriangle,
  Boxes,
  Calendar,
  SlidersHorizontal,
  LogOut,
  User,
  Settings,
  X,
  Database,
  Command,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useApp, PageId } from '../../context/AppContext';

export interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const {
    activePage,
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigate,
    logout,
    globalSearchQuery,
    setGlobalSearchQuery,
    supabaseStatus,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Breadcrumb / page context matching Section H
  const getPageContext = () => {
    switch (activePage) {
      case 'dashboard':
        return { section: 'Dashboard', page: 'Ringkasan operasional ZIPLIND hari ini' };
      case 'survey':
        return { section: 'Operations', page: 'Survey & Pengukuran' };
      case 'pemasangan':
        return { section: 'Operations', page: 'Pemasangan Roller Blind' };
      case 'target':
        return { section: 'Operations', page: 'Target Pekerjaan Teknisi' };
      case 'maintenance':
        return { section: 'Operations', page: 'Maintenance & Servis Alat' };
      case 'teknisi':
        return { section: 'Operations', page: 'Data Teknisi Lapangan' };
      case 'jadwal':
        return { section: 'Operations', page: 'Kalender & Jadwal' };
      case 'peralatan':
        return { section: 'Inventory', page: 'Peralatan & Alat Kerja' };
      case 'peminjaman':
        return { section: 'Inventory', page: 'Peminjaman Alat' };
      case 'material':
        return { section: 'Inventory', page: 'Material & Kain Roller Blind' };
      case 'laporan':
        return { section: 'Reporting', page: 'Laporan Operasional' };
      case 'dokumentasi':
        return { section: 'Reporting', page: 'Dokumentasi & Galeri Foto' };
      case 'notifikasi':
        return { section: 'System', page: 'Pusat Notifikasi' };
      case 'pengaturan':
        return { section: 'System', page: 'Pengaturan & Supabase' };
      default:
        return { section: 'Overview', page: 'Operasional' };
    }
  };

  const context = getPageContext();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'stock':
        return <Boxes className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'schedule':
        return <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'maintenance':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  const handleNotificationClick = (item: (typeof notifications)[0]) => {
    markNotificationAsRead(item.id);
    setIsNotifOpen(false);
    if (item.linkPage) {
      navigate(item.linkPage as PageId);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/95 backdrop-blur-md border-b border-[#DCE5EF] px-5 lg:px-8 xl:px-10 flex items-center justify-between gap-4 shadow-[0_1px_8px_rgba(11,37,70,0.03)]">
      {/* KIRI: Breadcrumb / Context Page */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-medium tracking-tight">
          <span className="text-slate-400 hover:text-slate-900 cursor-pointer" onClick={() => navigate('dashboard')}>
            {context.section}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">
            {context.page}
          </span>
        </div>

        <div className="sm:hidden text-xs font-bold text-slate-900 truncate">
          {context.page}
        </div>
      </div>

      {/* KANAN: Search, Notifications, Supabase, Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Global Search Bar with Ctrl+K shortcut */}
        <div className="hidden md:flex relative items-center w-72 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Cari pekerjaan, teknisi, pelanggan..."
            className="w-full bg-[#F8FAFC] hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs rounded-full border border-slate-200/80 pl-9 pr-14 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] placeholder:text-slate-400"
          />
          {globalSearchQuery ? (
            <button
              type="button"
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-400 pointer-events-none shadow-2xs">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Mobile Search Icon Toggle */}
        <button
          type="button"
          onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B88710] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Preview */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#111827] tracking-tight">Notifikasi</h4>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] font-semibold bg-[#FAF2DF] text-[#8C6207] px-2 py-0.5 rounded-full border border-[#F2E0B5]">
                      {unreadNotificationCount} Baru
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#B88710] hover:text-[#8C6207] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tandai Semua</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                        !item.read ? 'bg-[#FAF2DF]/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-[#111827] truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {item.relativeTime}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-[#E5E7EB] text-center bg-[#F5F6F8]/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('notifikasi');
                  }}
                  className="text-[11px] font-semibold text-[#111827] hover:text-[#B88710] transition-colors cursor-pointer"
                >
                  Buka Semua Notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supabase Realtime Status Pill (from design reference) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          <span>Supabase Realtime</span>
        </div>

        {/* Profile Element (Section H) */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              MA
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {currentUser.role}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-1.5 z-50 animate-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-[#111827]">{currentUser.name}</p>
                <p className="text-[11px] text-[#64748B] truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-slate-100 text-[#111827] px-2 py-0.5 rounded-md">
                  {currentUser.role}
                </span>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('pengaturan');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profil & Supabase</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('pengaturan');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </button>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      {isSearchOpenMobile && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-3 bg-white border-b border-[#E5E7EB] shadow-md z-40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search pekerjaan, teknisi, pelanggan..."
              className="w-full bg-[#F5F6F8] text-[#111827] text-xs rounded-xl border border-[#E5E7EB] pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
