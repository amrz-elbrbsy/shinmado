import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  AlertTriangle,
  Boxes,
  Calendar,
  SlidersHorizontal,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp, PageId } from '../../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigate,
    showToast,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'stock':
        return <Boxes className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'maintenance':
        return <SlidersHorizontal className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const filteredNotifs = notifications.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const warningCount = notifications.filter((n) => n.type === 'warning' || n.type === 'stock').length;
  const scheduleCount = notifications.filter((n) => n.type === 'schedule' || n.type === 'maintenance').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Pusat Notifikasi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Aktivitas & Peringatan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Log peringatan sistem, jadwal survey mendesak, stok menipis, dan jadwal servis berkala.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            size="md"
            variant="outline"
            leftIcon={<CheckCheck className="w-4 h-4 text-[#8C6207]" />}
            onClick={() => {
              markAllNotificationsAsRead();
              showToast('Semua notifikasi telah ditandai dibaca');
            }}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Notifikasi</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{notifications.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua riwayat log</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Belum Dibaca</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{unreadNotificationCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Perlu perhatian segera</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Peringatan Stok & Alat</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{warningCount}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Kondisi butuh tindakan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Agenda & Servis</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#8C6207] mt-2">{scheduleCount}</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Operasional berjalan</p>
        </div>
      </div>

      {/* Filter & Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan notifikasi..."
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'stock', label: 'Stok Material' },
              { id: 'schedule', label: 'Jadwal' },
              { id: 'maintenance', label: 'Servis Alat' },
              { id: 'warning', label: 'Peringatan' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-[#B88710] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada notifikasi yang ditemukan.
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                  !item.read ? 'bg-[#FAF2DF]/30' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 mt-0.5">
                    {getNotifIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#B88710] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 inline-block">
                      {item.relativeTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationAsRead(item.id)}
                      className="text-xs text-[#8C6207] hover:text-[#B88710] font-bold px-2.5 py-1 rounded-lg hover:bg-[#FAF2DF] transition-colors cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  {item.linkPage && (
                    <Button
                      size="sm"
                      variant="outline"
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                      onClick={() => {
                        markNotificationAsRead(item.id);
                        navigate(item.linkPage as PageId);
                      }}
                      className="text-xs font-bold border-slate-200 hover:bg-slate-50"
                    >
                      Buka Modul
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
