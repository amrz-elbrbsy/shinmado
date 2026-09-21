import React, { useState } from 'react';
import {
  Target as TargetIcon,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';
import { Target, TargetStatus } from '../../types';

export const TargetsPage: React.FC = () => {
  const { targets, addTarget, updateTarget, deleteTarget, technicians } = useApp();

  const [filterTech, setFilterTech] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(() => targets[0] || null);

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Target | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    technicianId: 'TKN-001',
    technicianName: 'Arwan',
    periodStart: '2026-09-18',
    periodEnd: '2026-09-20',
    targetSets: 30,
    actualSets: 24,
    status: 'Berjalan' as TargetStatus,
  });

  const filteredTargets = targets.filter((t) => {
    if (filterTech !== 'all' && t.technicianName !== filterTech) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTarget(null);
    setFormData({
      technicianId: technicians[0]?.id || 'TKN-001',
      technicianName: technicians[0]?.name || 'Arwan',
      periodStart: '2026-09-18',
      periodEnd: '2026-09-20',
      targetSets: 30,
      actualSets: 0,
      status: 'Berjalan',
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (tgt: Target) => {
    setEditingTarget(tgt);
    setFormData({
      technicianId: tgt.technicianId,
      technicianName: tgt.technicianName,
      periodStart: tgt.periodStart,
      periodEnd: tgt.periodEnd,
      targetSets: tgt.targetSets,
      actualSets: tgt.actualSets,
      status: tgt.status,
    });
    setIsAddDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTarget) {
      updateTarget(editingTarget.id, formData);
    } else {
      addTarget(formData);
    }
    setIsAddDrawerOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingTarget) {
      deleteTarget(deletingTarget.id);
      if (selectedTarget?.id === deletingTarget.id) {
        setSelectedTarget(targets.find((t) => t.id !== deletingTarget.id) || null);
      }
      setDeletingTarget(null);
    }
  };

  // Active target to show in highlight card
  const activeDetailTarget = selectedTarget || filteredTargets[0] || targets[0];

  const totalTargetQuota = targets.reduce((acc, t) => acc + t.targetSets, 0);
  const totalActualInstalled = targets.reduce((acc, t) => acc + t.actualSets, 0);
  const avgAchievement = targets.length > 0
    ? Math.round(targets.reduce((acc, t) => acc + t.progressPercentage, 0) / targets.length)
    : 0;
  const activeTechCount = new Set(targets.map((t) => t.technicianId)).size;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Kinerja Lapangan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Target Teknisi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Monitoring target pemasangan set roller blind, capaian bulanan, dan evaluasi performa per teknisi.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          className="font-bold text-xs shadow-xs"
        >
          + Tambah Target
        </Button>
      </div>

      {/* 4 SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Target Kuota</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <TargetIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalTargetQuota} <span className="text-xs font-medium text-slate-400">Set</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Seluruh tim teknisi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Aktual Terpasang</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalActualInstalled} <span className="text-xs font-medium text-slate-400">Set</span>
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">
            Sisa {Math.max(0, totalTargetQuota - totalActualInstalled)} set
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rata-rata Pencapaian</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{avgAchievement}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tingkat efisiensi instalasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Teknisi Bertarget</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeTechCount} Personil</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Penugasan aktif periode ini</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-56">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Filter Teknisi
            </label>
            <select
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
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

          <div className="w-56">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">Teknisi</th>
                <th className="py-3.5 px-6">Periode</th>
                <th className="py-3.5 px-6">Target</th>
                <th className="py-3.5 px-6">Aktual</th>
                <th className="py-3.5 px-6">Progress</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <EmptyState
                      title="Tidak Ada Target"
                      description="Belum ada target yang cocok dengan filter yang dipilih."
                      actionLabel="Buat Target Baru"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                filteredTargets.map((tgt) => (
                  <tr
                    key={tgt.id}
                    onClick={() => setSelectedTarget(tgt)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      activeDetailTarget?.id === tgt.id ? 'bg-[#FAF2DF]/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tgt.technicianName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900">{tgt.technicianName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{tgt.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px]">
                      {tgt.periodStart} – {tgt.periodEnd}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{tgt.targetSets} Set</td>
                    <td className="py-3.5 px-6 font-bold text-[#8C6207]">{tgt.actualSets} Set</td>
                    <td className="py-3.5 px-6">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-400">Pencapaian</span>
                          <span className="font-bold text-slate-900">
                            {tgt.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              tgt.progressPercentage >= 100
                                ? 'bg-emerald-500'
                                : tgt.progressPercentage >= 70
                                ? 'bg-[#B88710]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, tgt.progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={tgt.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(tgt);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTarget(tgt);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARGET DETAIL CARD */}
      {activeDetailTarget && (
        <div className="bg-[#0B2546] text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <Avatar name={activeDetailTarget.technicianName} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {activeDetailTarget.technicianName}
                  </h3>
                  <span className="text-xs bg-[#FAF2DF]/20 text-[#FAF2DF] px-2.5 py-0.5 rounded-full border border-[#FAF2DF]/30 font-semibold">
                    {activeDetailTarget.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Periode: {activeDetailTarget.periodStart} – {activeDetailTarget.periodEnd}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
                {activeDetailTarget.daysRemaining ?? 2} Hari Tersisa
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                onClick={() => handleOpenEdit(activeDetailTarget)}
              >
                Ubah Target
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 text-center sm:text-left">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Target Penugasan</span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                {activeDetailTarget.targetSets}
              </span>
              <span className="text-xs text-slate-400 ml-1">Set</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Aktual Terpasang</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#FAF2DF] font-mono">
                {activeDetailTarget.actualSets}
              </span>
              <span className="text-xs text-slate-400 ml-1">Set</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Progress Pencapaian</span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
                {activeDetailTarget.progressPercentage}%
              </span>
              <span className="text-xs text-emerald-400/80 block mt-0.5">
                {activeDetailTarget.targetSets - activeDetailTarget.actualSets > 0
                  ? `Sisa ${activeDetailTarget.targetSets - activeDetailTarget.actualSets} Set`
                  : 'Target Tercapai!'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={activeDetailTarget.progressPercentage}
              size="md"
              color={activeDetailTarget.progressPercentage >= 100 ? 'emerald' : 'gold'}
            />
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      <Modal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={editingTarget ? 'Edit Target Teknisi' : 'Tambah Target Teknisi'}
        subtitle="Tetapkan kuota set pemasangan roller blind per periode"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingTarget ? 'Simpan' : 'Tetapkan Target'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Teknisi *</label>
            <select
              value={formData.technicianName}
              onChange={(e) => {
                const found = technicians.find((t) => t.name === e.target.value);
                setFormData({
                  ...formData,
                  technicianName: e.target.value,
                  technicianId: found?.id || 'TKN-001',
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Periode Mulai *"
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              required
            />
            <Input
              label="Periode Selesai *"
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target (Set) *"
              type="number"
              min={1}
              value={formData.targetSets}
              onChange={(e) =>
                setFormData({ ...formData, targetSets: parseInt(e.target.value) || 1 })
              }
              required
            />
            <Input
              label="Aktual Terpasang (Set)"
              type="number"
              min={0}
              value={formData.actualSets}
              onChange={(e) =>
                setFormData({ ...formData, actualSets: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          {/* Calculated Progress Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-600">Calculated Progress:</span>
              <span className="text-[#8C6207] font-mono font-bold">
                {Math.round((formData.actualSets / (formData.targetSets || 1)) * 100)}%
              </span>
            </div>
            <ProgressBar
              value={Math.round((formData.actualSets / (formData.targetSets || 1)) * 100)}
              size="xs"
              color="gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as TargetStatus })
              }
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <ConfirmationDialog
        isOpen={Boolean(deletingTarget)}
        onClose={() => setDeletingTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Target Teknisi"
        message={
          <span>
            Hapus target untuk <strong>{deletingTarget?.technicianName}</strong>?
          </span>
        }
      />
    </div>
  );
};
