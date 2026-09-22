import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Wrench,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, MaintenanceStatus } from '../../types';

export const MaintenancePage: React.FC = () => {
  const {
    maintenanceRecords,
    equipment,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    navigate,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    equipmentId: string;
    equipmentName: string;
    maintenanceType: string;
    scheduledDate: string;
    cost: number;
    status: MaintenanceStatus;
    notes: string;
  }>({
    equipmentId: equipment[0]?.id || '',
    equipmentName: equipment[0]?.name || '',
    maintenanceType: 'Servis Motor',
    scheduledDate: new Date().toISOString().slice(0, 10),
    cost: 0,
    status: 'Terjadwal',
    notes: '',
  });

  const filteredRecords = maintenanceRecords.filter((rec) => {
    if (filterStatus !== 'all' && rec.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      equipmentId: equipment[0]?.id || '',
      equipmentName: equipment[0]?.name || '',
      maintenanceType: 'Servis Motor',
      scheduledDate: new Date().toISOString().slice(0, 10),
      cost: 0,
      status: 'Terjadwal',
      notes: '',
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (rec: MaintenanceRecord) => {
    setEditingRecord(rec);
    setFormData({
      equipmentId: rec.equipmentId,
      equipmentName: rec.equipmentName,
      maintenanceType: rec.maintenanceType,
      scheduledDate: rec.scheduledDate,
      cost: rec.cost,
      status: rec.status,
      notes: rec.notes || '',
    });
    setIsAddDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipmentId || !formData.maintenanceType) return;

    if (editingRecord) {
      updateMaintenanceRecord(editingRecord.id, formData);
    } else {
      addMaintenanceRecord(formData);
    }
    setIsAddDrawerOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingRecord) {
      deleteMaintenanceRecord(deletingRecord.id);
      setDeletingRecord(null);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Inventaris & Peralatan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Maintenance Alat</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Jadwal perawatan berkala, servis mesin, dan perbaikan inventaris teknisi ZIPBLIND.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Wrench className="w-4 h-4" />}
            onClick={() => navigate('peralatan')}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Daftar Alat
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="font-bold text-xs shadow-xs"
          >
            + Jadwalkan Maintenance
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Servis</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{maintenanceRecords.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Riwayat & agenda servis</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dalam Proses</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {maintenanceRecords.filter((r) => r.status === 'Dalam Proses').length}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Sedang dikerjakan teknisi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Terjadwal</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {maintenanceRecords.filter((r) => r.status === 'Terjadwal').length}
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Menunggu jadwal servis</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {maintenanceRecords.filter((r) => r.status === 'Selesai').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Unit normal & siap pakai</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status Maintenance</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai">Selesai</option>
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
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Nama Alat</th>
                <th className="py-3.5 px-6">Jenis Maintenance</th>
                <th className="py-3.5 px-6">Tgl Terjadwal</th>
                <th className="py-3.5 px-6">Biaya</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      title="Tidak Ada Jadwal Maintenance"
                      description="Semua peralatan dalam kondisi siap pakai."
                      actionLabel="Jadwalkan Maintenance Baru"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{rec.id}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.equipmentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {rec.maintenanceType}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 text-[11px]">
                      {rec.scheduledDate}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-slate-900">
                      {formatRupiah(rec.cost)}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={rec.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRecord(rec)}
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

      {/* FORM MODAL (Pilih alat, Jenis maintenance, Tanggal, Estimasi biaya, Status, Catatan) */}
      <Modal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={editingRecord ? 'Edit Jadwal Maintenance' : 'Jadwalkan Maintenance Alat'}
        subtitle="Rencanakan servis rutin atau perbaikan kerusakan alat"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingRecord ? 'Simpan' : 'Jadwalkan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Alat *</label>
            <select
              value={formData.equipmentId}
              onChange={(e) => {
                const eq = equipment.find((item) => item.id === e.target.value);
                setFormData({
                  ...formData,
                  equipmentId: e.target.value,
                  equipmentName: eq?.name || '',
                });
              }}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.id})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Jenis Maintenance *"
            placeholder="Contoh: Servis Motor / Ganti Carbon Brush"
            value={formData.maintenanceType}
            onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Servis *"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
            <Input
              label="Estimasi Biaya (Rp) *"
              type="number"
              min={0}
              step={10000}
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as MaintenanceStatus })
              }
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Terjadwal">Terjadwal</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detail bengkel rekanan, garansi servis, suku cadang..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmationDialog
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Jadwal Maintenance"
        message={<span>Hapus catatan maintenance {deletingRecord?.maintenanceType}?</span>}
      />
    </div>
  );
};
