import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { ProgressBar } from '../ui/ProgressBar';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { Technician } from '../../types';

export const TechniciansPage: React.FC = () => {
  const {
    technicians,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    schedules,
    targets,
    navigate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [viewingTech, setViewingTech] = useState<Technician | null>(null);
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);

  // Form states (minimal required fields: Nama & Status)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'Aktif' as Technician['status'],
  });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  const filteredTechnicians = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingTech(null);
    setFormData({ name: '', phone: '', status: 'Aktif' });
    setFormErrors({});
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (tech: Technician) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      phone: tech.phone || '',
      status: tech.status,
    });
    setFormErrors({});
    setIsAddDrawerOpen(true);
  };

  const validateForm = () => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama teknisi wajib diisi';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingTech) {
      updateTechnician(editingTech.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        status: formData.status,
      });
    } else {
      addTechnician({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        status: formData.status,
      });
    }

    setIsAddDrawerOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingTech) {
      deleteTechnician(deletingTech.id);
      setDeletingTech(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Sumber Daya Manusia
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Data Teknisi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Kelola data personil teknisi, status penugasan, dan pemantauan performa operasional ZIPBLIND.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
          className="font-bold text-xs shadow-xs"
        >
          + Tambah Teknisi
        </Button>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Teknisi</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{technicians.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Personil terdaftar resmi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Teknisi Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {technicians.filter((t) => t.status === 'Aktif').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Siap tugas lapangan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Jadwal Ditugaskan</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{schedules.length}</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Agenda tugas aktif</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rata-rata Target</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {Math.round(
              technicians.reduce((acc, t) => acc + (t.currentTargetPercentage || 0), 0) /
                (technicians.length || 1)
            )}
            %
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Capaian tim keseluruhan</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teknisi berdasarkan nama atau ID..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] placeholder:text-slate-400"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Total: <strong className="text-slate-900 font-bold">{filteredTechnicians.length}</strong> Teknisi
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Nama</th>
                <th className="py-3.5 px-6">Jadwal Aktif</th>
                <th className="py-3.5 px-6">Target Berjalan</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <EmptyState
                      title="Teknisi Tidak Ditemukan"
                      description="Tidak ada data teknisi yang sesuai dengan kata kunci pencarian Anda."
                    />
                  </td>
                </tr>
              ) : (
                filteredTechnicians.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-semibold text-slate-900">
                      {tech.id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tech.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900">{tech.name}</p>
                          {tech.phone && (
                            <p className="text-[11px] text-slate-400 font-mono">{tech.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF2DF] text-[#8C6207] font-semibold text-xs border border-[#F2E0B5]">
                        <Calendar className="w-3.5 h-3.5" />
                        {tech.activeSchedules ?? 0} Jadwal
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-bold text-slate-800">
                            {tech.currentTargetPercentage ?? 0}%
                          </span>
                        </div>
                        <ProgressBar
                          value={tech.currentTargetPercentage ?? 0}
                          size="xs"
                          color={
                            (tech.currentTargetPercentage ?? 0) >= 100
                              ? 'emerald'
                              : 'gold'
                          }
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={tech.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingTech(tech)}
                          title="Lihat Detail"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tech)}
                          title="Edit Teknisi"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTech(tech)}
                          title="Hapus Teknisi"
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

        {/* MOBILE CARDS / LIST (Stage 5 requirement) */}
        <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
          {filteredTechnicians.length === 0 ? (
            <EmptyState
              title="Teknisi Tidak Ditemukan"
              description="Tidak ada teknisi yang cocok dengan pencarian Anda."
            />
          ) : (
            filteredTechnicians.map((tech) => (
              <div
                key={tech.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={tech.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{tech.name}</h4>
                        <Badge status={tech.status} size="sm" />
                      </div>
                      <p className="text-xs font-mono text-slate-400">{tech.id}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Jadwal Aktif</span>
                    <span className="font-bold text-slate-800">
                      {tech.activeSchedules ?? 0} Jadwal
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Target Berjalan</span>
                    <span className="font-bold text-[#8C6207] font-mono">
                      {tech.currentTargetPercentage ?? 0}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewingTech(tech)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenEdit(tech)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeletingTech(tech)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FORM MODAL (Add / Edit Technician) */}
      <Modal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={editingTech ? 'Edit Data Teknisi' : 'Tambah Teknisi Baru'}
        subtitle="Kelola profil teknisi roller blind internal PT Shinmado"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingTech ? 'Simpan Perubahan' : 'Daftarkan Teknisi'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Teknisi *"
            placeholder="Contoh: Arwan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Nomor WhatsApp / Telepon"
            placeholder="Contoh: 0812-3456-7890"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Teknisi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Aktif' })}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === 'Aktif'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aktif</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Nonaktif' })}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.status === 'Nonaktif'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Nonaktif</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* VIEW TECHNICIAN DETAIL MODAL */}
      {viewingTech && (
        <Modal
          isOpen={Boolean(viewingTech)}
          onClose={() => setViewingTech(null)}
          title={`Detail Teknisi: ${viewingTech.name}`}
          subtitle={viewingTech.id}
          maxWidth="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setViewingTech(null)}>
              Tutup
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Avatar name={viewingTech.name} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingTech.name}</h3>
                <p className="text-xs font-mono text-slate-500">{viewingTech.id}</p>
                <div className="mt-2">
                  <Badge status={viewingTech.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Jadwal Aktif Terdaftar
                </span>
                <span className="text-lg font-bold text-[#8C6207]">
                  {viewingTech.activeSchedules ?? 0} Agenda
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Pencapaian Target
                </span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  {viewingTech.currentTargetPercentage ?? 0}%
                </span>
              </div>
            </div>

            {/* Related Schedules for this technician */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Jadwal Tugas Teknisi</h4>
              <div className="space-y-2">
                {schedules
                  .filter(
                    (s) =>
                      s.technicianId === viewingTech.id ||
                      s.technicianName.toLowerCase().includes(viewingTech.name.toLowerCase())
                  )
                  .map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3 rounded-xl border border-slate-200/70 bg-white text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{sch.type}</span>
                        <Badge status={sch.status} size="sm" />
                      </div>
                      <p className="text-slate-600">{sch.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {sch.date} • {sch.time} WIB • {sch.location}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMATION DELETE MODAL (Stage 5 requirement) */}
      <ConfirmationDialog
        isOpen={Boolean(deletingTech)}
        onClose={() => setDeletingTech(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Teknisi"
        message={
          <span>
            Apakah Anda yakin ingin menghapus data teknisi{' '}
            <strong>{deletingTech?.name}</strong> ({deletingTech?.id})? Tindakan ini tidak dapat
            dibatalkan.
          </span>
        }
        confirmLabel="Hapus Teknisi"
      />
    </div>
  );
};
