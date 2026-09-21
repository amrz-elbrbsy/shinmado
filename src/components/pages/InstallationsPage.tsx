import React, { useState } from 'react';
import {
  Hammer,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  FileText,
  Filter,
  TrendingUp,
  AlertCircle,
  Building,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useApp } from '../../context/AppContext';
import { Installation } from '../../types';

export const InstallationsPage: React.FC = () => {
  const { installations, technicians, addInstallation, updateInstallation, deleteInstallation, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstallId, setEditingInstallId] = useState<string | null>(null);

  // Quick Progress Modal
  const [progressModalInstall, setProgressModalInstall] = useState<Installation | null>(null);
  const [dailyCompletedInput, setDailyCompletedInput] = useState<number>(0);
  const [dailyNotesInput, setDailyNotesInput] = useState<string>('');

  // Form State
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [technicianName, setTechnicianName] = useState(technicians[0]?.name || 'Dimas');
  const [teamMembers, setTeamMembers] = useState('Fajar, Rehan');
  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-24');
  const [totalSets, setTotalSets] = useState(18);
  const [completedSets, setCompletedSets] = useState(12);
  const [status, setStatus] = useState<Installation['status']>('Dalam Proses');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingInstallId(null);
    setProjectName('');
    setCustomerName('');
    setLocation('');
    setTechnicianName(technicians[0]?.name || 'Dimas');
    setTeamMembers('Fajar');
    setStartDate('2026-09-20');
    setEndDate('2026-09-22');
    setTotalSets(10);
    setCompletedSets(0);
    setStatus('Dalam Proses');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (inst: Installation) => {
    setEditingInstallId(inst.id);
    setProjectName(inst.projectName);
    setCustomerName(inst.customerName);
    setLocation(inst.location);
    setTechnicianName(inst.technicianName);
    setTeamMembers(inst.teamMembers?.join(', ') || '');
    setStartDate(inst.startDate);
    setEndDate(inst.endDate || '');
    setTotalSets(inst.totalSets);
    setCompletedSets(inst.completedSets);
    setStatus(inst.status);
    setNotes(inst.notes || '');
    setIsModalOpen(true);
  };

  const openProgressModal = (inst: Installation) => {
    setProgressModalInstall(inst);
    setDailyCompletedInput(inst.completedSets);
    setDailyNotesInput(inst.notes || '');
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModalInstall) return;

    const newCompleted = Math.min(progressModalInstall.totalSets, Math.max(0, dailyCompletedInput));
    const newPercentage = Math.round((newCompleted / progressModalInstall.totalSets) * 100);
    const newStatus = newCompleted >= progressModalInstall.totalSets ? 'Selesai' : 'Dalam Proses';

    updateInstallation(progressModalInstall.id, {
      completedSets: newCompleted,
      progressPercentage: newPercentage,
      status: newStatus,
      notes: dailyNotesInput,
    });

    setProgressModalInstall(null);
    showToast(`Progress diperbarui: ${newCompleted}/${progressModalInstall.totalSets} Set (${newPercentage}%)`);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !location) {
      showToast('Harap isi nama proyek dan alamat lokasi', undefined, 'error');
      return;
    }

    const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    const techObj = technicians.find((t) => t.name === technicianName);
    const parsedTeam = teamMembers.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingInstallId) {
      updateInstallation(editingInstallId, {
        projectName,
        customerName: customerName || projectName,
        location,
        technicianId: techObj?.id || 'TKN-001',
        technicianName,
        teamMembers: parsedTeam,
        startDate,
        endDate,
        totalSets,
        completedSets,
        progressPercentage: percentage,
        status,
        notes,
      });
    } else {
      addInstallation({
        projectName,
        customerName: customerName || projectName,
        location,
        technicianId: techObj?.id || 'TKN-001',
        technicianName,
        teamMembers: parsedTeam,
        startDate,
        endDate,
        totalSets,
        completedSets,
        progressPercentage: percentage,
        status,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const filteredInstallations = installations.filter((item) => {
    const matchesSearch =
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technicianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalProjects = installations.length;
  const inProgressCount = installations.filter((i) => i.status === 'Dalam Proses').length;
  const completedProjectsCount = installations.filter((i) => i.status === 'Selesai').length;
  const totalSetsInstalled = installations.reduce((acc, i) => acc + i.completedSets, 0);
  const totalSetsTarget = installations.reduce((acc, i) => acc + i.totalSets, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Operasional Pemasangan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemasangan Roller Blind
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Monitoring proyek instalasi multi-hari, penugasan teknisi, dan pembaruan progress harian.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4 text-white" />}
          onClick={openAddModal}
          className="shadow-xs font-bold text-xs"
        >
          + Buat Pemasangan Baru
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Proyek</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Hammer className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalProjects}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua instalasi terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sedang Berjalan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Pengerjaan aktif lapangan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Volume Unit Terpasang</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalSetsInstalled} <span className="text-sm font-semibold text-slate-400">/ {totalSetsTarget} set</span>
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">
            {totalSetsTarget > 0 ? Math.round((totalSetsInstalled / totalSetsTarget) * 100) : 0}% pencapaian keseluruhan
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Proyek Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{completedProjectsCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Selesai & BAST ditandatangani</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama proyek, pelanggan, lokasi, atau teknisi..."
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid for Multi-Day Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInstallations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:border-[#B88710]/40 hover:shadow-md transition-all duration-200"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{item.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                    {item.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{item.customerName}</p>
                </div>
                <Badge status={item.status} size="sm" />
              </div>

              <div className="space-y-2.5 my-3.5 text-xs text-slate-700">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.location}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {item.startDate} — {item.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#8C6207] font-semibold">
                  <Users className="w-3.5 h-3.5 shrink-0 text-[#B88710]" />
                  <span>
                    Lead: {item.technicianName}
                    {item.teamMembers && item.teamMembers.length > 0 && ` (+${item.teamMembers.join(', ')})`}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Unit Count */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Progress Pemasangan</span>
                  <span className="text-slate-900">
                    {item.completedSets} / {item.totalSets} Set <span className="text-[#B88710]">({item.progressPercentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-[#B88710]'
                    }`}
                    style={{ width: `${Math.min(100, item.progressPercentage)}%` }}
                  />
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-500 italic mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                  "{item.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3.5 mt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => openProgressModal(item)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] hover:bg-[#F2E0B5] transition-colors cursor-pointer"
              >
                Update Progress
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-[#FAF2DF] hover:text-[#8C6207] transition-colors cursor-pointer"
                  title="Edit Proyek"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteInstallation(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Hapus Proyek"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK UPDATE PROGRESS MODAL */}
      {progressModalInstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8C6207] uppercase">UPDATE PROGRES HARIAN</span>
                <h3 className="text-base font-bold text-[#111827]">{progressModalInstall.projectName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setProgressModalInstall(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Total Set Terpasang Sekarang</span>
                  <span className="text-[#8C6207] font-bold">Target: {progressModalInstall.totalSets} Set</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={progressModalInstall.totalSets}
                    value={dailyCompletedInput}
                    onChange={(e) => setDailyCompletedInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-base font-bold rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] text-center outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">Set</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Harian / Kendala Lapangan
                </label>
                <textarea
                  rows={3}
                  value={dailyNotesInput}
                  onChange={(e) => setDailyNotesInput(e.target.value)}
                  placeholder="Contoh: Hari ini selesai 5 set di lantai 2. Steker listrik motorized sudah dites dan siap."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setProgressModalInstall(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Progress
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL: BUAT / EDIT PROYEK PEMASANGAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-[#B88710]" />
                <h3 className="text-base font-bold text-[#111827]">
                  {editingInstallId ? 'Edit Proyek Pemasangan' : 'Buat Proyek Pemasangan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Proyek / Gedung *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Contoh: Perumahan Citra Residence / Menara BCA Lt. 12"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: PT Surya Cipta / Bpk. Gunawan"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jl. Boulevard Barat No. 88, Kelapa Gading, Jakarta Utara"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teknisi Lead</label>
                  <select
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none cursor-pointer"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tim Teknisi Tambahan</label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    placeholder="Contoh: Fajar, Rehan"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Unit (Set)</label>
                  <input
                    type="number"
                    min="1"
                    value={totalSets}
                    onChange={(e) => setTotalSets(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Proyek</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none cursor-pointer"
                  >
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Tertunda">Tertunda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Teknis</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan pemasangan, braket, steker, atau tangga scaffolding..."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Proyek
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
