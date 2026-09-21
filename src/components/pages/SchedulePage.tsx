import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  Layers,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { Modal } from '../ui/Modal';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { Schedule, JobType, ScheduleStatus } from '../../types';

export const SchedulePage: React.FC = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, technicians } = useApp();

  // Active Tab: Semua | Survey / Pengukuran | Pemasangan | Perbaikan | Lainnya
  const [activeTab, setActiveTab] = useState<string>('Semua');

  // Interactive Calendar State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed, 8 = September
  const [selectedDate, setSelectedDate] = useState('2026-09-18');

  // Filters
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Drawers & Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState<{
    date: string;
    time: string;
    type: JobType;
    sales: string;
    technicianId: string;
    technicianName: string;
    assistantTechnicianName: string;
    customerName: string;
    setsCount: number;
    location: string;
    status: ScheduleStatus;
    notes: string;
  }>({
    date: '2026-09-18',
    time: '09:00',
    type: 'Survey',
    sales: 'Sales Andi',
    technicianId: 'TKN-001',
    technicianName: 'Arwan',
    assistantTechnicianName: 'Arwan',
    customerName: '',
    setsCount: 1,
    location: '',
    status: 'Terjadwal',
    notes: '',
  });

  const tabItems = [
    { id: 'Semua', label: 'Semua', count: schedules.length },
    {
      id: 'Survey',
      label: 'Survey / Pengukuran',
      count: schedules.filter((s) => s.type === 'Survey').length,
    },
    {
      id: 'Pemasangan',
      label: 'Pemasangan',
      count: schedules.filter((s) => s.type === 'Pemasangan').length,
    },
    {
      id: 'Perbaikan',
      label: 'Perbaikan',
      count: schedules.filter((s) => s.type === 'Perbaikan').length,
    },
    {
      id: 'Lainnya',
      label: 'Lainnya',
      count: schedules.filter((s) => s.type === 'Lainnya').length,
    },
  ];

  // Calendar calculations
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setSelectedDate(`${currentYear}-${formattedMonth}-${formattedDay}`);
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((sch) => {
    if (activeTab !== 'Semua' && sch.type !== activeTab) return false;
    if (filterJobType !== 'all' && sch.type !== filterJobType) return false;
    if (filterTechnician !== 'all' && sch.technicianName !== filterTechnician) return false;
    if (filterSales !== 'all' && sch.sales !== filterSales) return false;
    if (filterStatus !== 'all' && sch.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormData({
      date: selectedDate || '2026-09-18',
      time: '09:00',
      type: 'Survey',
      sales: 'Sales Andi',
      technicianId: technicians[0]?.id || 'TKN-001',
      technicianName: technicians[0]?.name || 'Arwan',
      assistantTechnicianName: technicians[0]?.name || 'Arwan',
      customerName: '',
      setsCount: 8,
      location: 'Jakarta Selatan',
      status: 'Terjadwal',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setEditingSchedule(sch);
    setFormData({
      date: sch.date,
      time: sch.time,
      type: sch.type,
      sales: sch.sales || '',
      technicianId: sch.technicianId,
      technicianName: sch.technicianName,
      assistantTechnicianName: sch.assistantTechnicianName || '',
      customerName: sch.customerName,
      setsCount: sch.setsCount || 1,
      location: sch.location,
      status: sch.status,
      notes: sch.notes || '',
    });
    setViewingSchedule(null);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.location) return;

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, formData);
    } else {
      addSchedule(formData);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingSchedule) {
      deleteSchedule(deletingSchedule.id);
      setDeletingSchedule(null);
      setViewingSchedule(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Manajemen Penjadwalan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Jadwal Lapangan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Manajemen agenda survey, pengukuran, dan pemasangan roller blind PT SHINMADO.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          className="font-bold text-xs shadow-xs"
        >
          + Tambah Jadwal
        </Button>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Agenda</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{schedules.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Penugasan terjadwal</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Survey Lapangan</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {schedules.filter((s) => s.type === 'Survey').length}
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Pengukuran lokasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pemasangan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {schedules.filter((s) => s.type === 'Pemasangan').length}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Instalasi roller blind</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {schedules.filter((s) => s.status === 'Selesai').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Pekerjaan rampung</p>
        </div>
      </div>

      {/* TABS (Stage 6) */}
      <div className="border-b border-slate-200">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          variant="underline"
        />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tanggal Terpilih
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Jenis Pekerjaan
            </label>
            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Jenis</option>
              <option value="Survey">Survey / Pengukuran</option>
              <option value="Pemasangan">Pemasangan</option>
              <option value="Perbaikan">Perbaikan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Teknisi
            </label>
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Teknisi</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Sales
            </label>
            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Sales</option>
              <option value="Sales Andi">Sales Andi</option>
              <option value="Sales Deni">Sales Deni</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Status Agenda
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: Desktop Calendar + List (Stage 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Interactive Mini Calendar widget (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span>{`${monthNames[currentMonth]} ${currentYear}`}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            }
            padding="sm"
          >
            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 py-1 border-b border-slate-100">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Month Day Grid */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {/* Empty padding days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedDay = String(day).padStart(2, '0');
                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = selectedDate === dateKey;
                const hasSchedule = schedules.some((s) => s.date === dateKey);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`h-8 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#B88710] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                    {hasSchedule && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#B88710]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B88710]" /> Agenda Aktif
              </span>
              <button
                type="button"
                onClick={() => setSelectedDate('2026-09-18')}
                className="text-[#8C6207] font-semibold hover:underline"
              >
                Hari Ini
              </button>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Agenda List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800">
              Agenda Jadwal ({filteredSchedules.length})
            </h3>
            <span className="text-xs text-slate-500">
              Filter tanggal: <strong className="font-mono text-slate-700">{selectedDate}</strong>
            </span>
          </div>

          {filteredSchedules.length === 0 ? (
            <EmptyState
              title="Tidak Ada Jadwal"
              description="Tidak ditemukan jadwal untuk kriteria filter atau tanggal yang dipilih."
              actionLabel="Tambah Jadwal Baru"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="space-y-3">
              {filteredSchedules.map((sch) => (
                <div
                  key={sch.id}
                  onClick={() => setViewingSchedule(sch)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#B88710]/50 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/70 shrink-0 text-center min-w-[70px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-bold font-mono text-slate-800 block">
                          {sch.time}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {sch.date.split('-').slice(1).join('/')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                            {sch.type}
                          </span>
                          <Badge status={sch.status} size="sm" />
                          {sch.setsCount && (
                            <span className="text-xs font-semibold bg-[#FAF2DF] text-[#8C6207] px-2 py-0.5 rounded-md border border-[#F2E0B5]">
                              {sch.setsCount} Set
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#8C6207] transition-colors">
                          {sch.customerName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                          {sch.sales && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" /> {sch.sales}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            Teknisi: {sch.technicianName}
                            {sch.assistantTechnicianName &&
                              sch.assistantTechnicianName !== sch.technicianName && (
                                <span className="text-slate-400">
                                  {' '}
                                  (Pendamping: {sch.assistantTechnicianName})
                                </span>
                              )}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" /> {sch.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(sch);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingSchedule(sch);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {viewingSchedule && (
        <Modal
          isOpen={Boolean(viewingSchedule)}
          onClose={() => setViewingSchedule(null)}
          title={`Detail Agenda: ${viewingSchedule.type}`}
          subtitle={`${viewingSchedule.date} pukul ${viewingSchedule.time} WIB`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingSchedule(null)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEdit(viewingSchedule)}
              >
                Edit Jadwal
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Status Agenda
                </span>
                <div className="mt-1">
                  <Badge status={viewingSchedule.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Jenis Pekerjaan
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {viewingSchedule.type}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Customer</span>
                <p className="text-sm font-bold text-slate-900">
                  {viewingSchedule.customerName}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Lokasi</span>
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {viewingSchedule.location}
                </p>
              </div>

              {viewingSchedule.type === 'Survey' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 font-medium">Sales Penanggung Jawab</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {viewingSchedule.sales || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 font-medium">Teknisi Pendamping</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {viewingSchedule.assistantTechnicianName || viewingSchedule.technicianName}
                    </p>
                  </div>
                </div>
              )}

              {viewingSchedule.type === 'Pemasangan' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 font-medium">Teknisi Pelaksana</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {viewingSchedule.technicianName}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-slate-400 font-medium">Jumlah Set</span>
                    <p className="text-xs font-bold text-[#8C6207] mt-0.5">
                      {viewingSchedule.setsCount || 0} Set Roller Blind
                    </p>
                  </div>
                </div>
              )}

              {viewingSchedule.notes && (
                <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
                  <span className="text-slate-400 font-medium">Catatan Lapangan</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {viewingSchedule.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        subtitle="Rencanakan agenda survey atau pemasangan teknisi"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingSchedule ? 'Simpan Perubahan' : 'Jadwalkan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Jam *"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Pekerjaan *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Survey">Survey / Pengukuran</option>
              <option value="Pemasangan">Pemasangan</option>
              <option value="Perbaikan">Perbaikan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Conditional minimal fields for Survey vs Pemasangan (Stage 6) */}
          {formData.type === 'Survey' ? (
            <>
              <Input
                label="Sales *"
                placeholder="Contoh: Sales Andi"
                value={formData.sales}
                onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teknisi Pendamping *
                </label>
                <select
                  value={formData.technicianName}
                  onChange={(e) => {
                    const sel = technicians.find((t) => t.name === e.target.value);
                    setFormData({
                      ...formData,
                      technicianName: e.target.value,
                      technicianId: sel?.id || 'TKN-001',
                      assistantTechnicianName: e.target.value,
                    });
                  }}
                  className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teknisi Pelaksana *
                </label>
                <select
                  value={formData.technicianName}
                  onChange={(e) => {
                    const sel = technicians.find((t) => t.name === e.target.value);
                    setFormData({
                      ...formData,
                      technicianName: e.target.value,
                      technicianId: sel?.id || 'TKN-001',
                    });
                  }}
                  className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Jumlah Set *"
                type="number"
                min={1}
                value={formData.setsCount}
                onChange={(e) =>
                  setFormData({ ...formData, setsCount: parseInt(e.target.value) || 1 })
                }
                required
              />
            </>
          )}

          <Input
            label="Nama Customer / Perusahaan *"
            placeholder="Contoh: Bapak Budi / PT Graha"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />

          <Input
            label="Lokasi / Alamat *"
            placeholder="Contoh: Jakarta Selatan"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ScheduleStatus })
              }
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Khusus
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan ukuran jendela, tipe kain blind, akses lokasi..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION MODAL DELETE */}
      <ConfirmationDialog
        isOpen={Boolean(deletingSchedule)}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Jadwal Operasional"
        message={
          <span>
            Apakah Anda yakin ingin menghapus jadwal{' '}
            <strong>{deletingSchedule?.customerName}</strong> ({deletingSchedule?.type})?
          </span>
        }
      />
    </div>
  );
};
