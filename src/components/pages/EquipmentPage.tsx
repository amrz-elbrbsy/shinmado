import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  ArrowLeftRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
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
import { Equipment, EquipmentCondition, EquipmentStatus, EquipmentUnit } from '../../types';

export const EquipmentPage: React.FC = () => {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    loans,
    technicians,
    addLoan,
    returnLoan,
    navigate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [unitBorrowerId, setUnitBorrowerId] = useState(technicians[0]?.id || '');
  const [unitReturnDate, setUnitReturnDate] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Power Tools',
    status: 'Tersedia' as EquipmentStatus,
    condition: 'Baik' as EquipmentCondition,
    serialNumber: '',
    notes: '',
    unitCount: 1,
  });

  const getUnits = (item: Equipment) => item.units || [{
    id: `${item.id}-UNIT-001`,
    equipmentId: item.id,
    code: `${item.code || item.id}-001`,
    status: item.status,
    condition: item.condition,
    serialNumber: item.serialNumber,
    currentBorrower: item.currentBorrower,
    currentBorrowerId: item.currentBorrowerId,
  }];
  const getUnitCounts = (item: Equipment) => {
    const units = getUnits(item);
    return {
      total: units.length,
      available: units.filter((unit) => unit.status === 'Tersedia').length,
      borrowed: units.filter((unit) => unit.status === 'Dipinjam').length,
      maintenance: units.filter((unit) => unit.status === 'Maintenance').length,
      damaged: units.filter((unit) => unit.status === 'Rusak').length,
    };
  };

  const categories = Array.from(new Set(equipment.map((e) => e.category)));

  const filteredEquipment = equipment.filter((item) => {
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && !getUnits(item).some((unit) => unit.status === filterStatus)) return false;
    if (filterCondition !== 'all' && !getUnits(item).some((unit) => unit.condition === filterCondition)) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingEquipment(null);
    setFormData({
      name: '',
      category: 'Power Tools',
      status: 'Tersedia',
      condition: 'Baik',
      serialNumber: '',
      notes: '',
      unitCount: 1,
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      category: item.category,
      status: item.status,
      condition: item.condition,
      serialNumber: item.serialNumber || '',
      notes: item.notes || '',
      unitCount: item.units?.length || 1,
    });
    setIsAddDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingEquipment) {
      updateEquipment(editingEquipment.id, formData);
    } else {
      addEquipment(formData);
    }
    setIsAddDrawerOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingEquipment) {
      deleteEquipment(deletingEquipment.id);
      setDeletingEquipment(null);
    }
  };

  const openUnitDetail = (item: Equipment) => {
    setViewingEquipment(item);
    setSelectedUnitId(getUnits(item).find((unit) => unit.status === 'Tersedia')?.id || '');
    setUnitBorrowerId(technicians[0]?.id || '');
    setUnitReturnDate('');
  };

  const handleUnitBorrow = (item: Equipment, unitId: string) => {
    const unit = getUnits(item).find((candidate) => candidate.id === unitId);
    const technician = technicians.find((candidate) => candidate.id === unitBorrowerId);
    if (!unit || unit.status !== 'Tersedia' || !technician) return;
    const created = addLoan({
      equipmentId: item.id,
      unitId: unit.id,
      unitCode: unit.code,
      equipmentCode: item.code,
      equipmentName: item.name,
      borrowerName: technician.name,
      technicianId: technician.id,
      borrowDate: new Date().toISOString().slice(0, 10),
      borrowedAt: new Date().toISOString(),
      estimatedReturnDate: unitReturnDate,
      status: 'Dipinjam',
    });
    if (created) setSelectedUnitId('');
  };

  const activeLoanForUnit = (unit: EquipmentUnit) =>
    loans.find((loan) =>
      (loan.unitId === unit.id || (!loan.unitId && loan.equipmentId === unit.equipmentId && loan.unitCode === unit.code)) &&
      (loan.status === 'Dipinjam' || loan.status === 'Terlambat')
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Inventaris Workshop
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Peralatan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Daftar inventaris dan status kelayakan alat teknisi instalasi roller blind ZIPBLIND PT SHINMADO.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
            onClick={() => navigate('peminjaman')}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Peminjaman Alat
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="font-bold text-xs shadow-xs"
          >
            + Tambah Alat
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Unit</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{equipment.reduce((sum, item) => sum + getUnits(item).length, 0)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unit terdata inventaris</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Alat Tersedia</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {equipment.reduce((sum, item) => sum + getUnits(item).filter((unit) => unit.status === 'Tersedia').length, 0)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Siap dipakai kerja</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sedang Dipinjam</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {equipment.reduce((sum, item) => sum + getUnits(item).filter((unit) => unit.status === 'Dipinjam').length, 0)}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Berada di teknisi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dalam Perawatan</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {equipment.reduce((sum, item) => sum + getUnits(item).filter((unit) => unit.status === 'Maintenance' || unit.status === 'Rusak').length, 0)}
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Servis atau kalibrasi</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat, seri, atau ID..."
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] transition-colors"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
            </select>
          </div>

          <div>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Perlu Servis">Perlu Servis</option>
            </select>
          </div>
        </div>
      </div>

      {/* EQUIPMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">ID & Nama Alat</th>
                <th className="py-3.5 px-6">Kategori</th>
                <th className="py-3.5 px-6">Ringkasan Unit</th>
                <th className="py-3.5 px-6">Kondisi</th>
                <th className="py-3.5 px-6">Peminjam Saat Ini</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <EmptyState
                      title="Peralatan Tidak Ditemukan"
                      description="Tidak ada alat yang sesuai dengan filter atau kata kunci."
                    />
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {(() => {
                      const counts = getUnitCounts(item);
                      return (
                        <>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#FAF2DF] text-[#B88710]">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.code || item.id} • {counts.total} unit {item.serialNumber ? `• SN: ${item.serialNumber}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-6">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-semibold">
                        <span>Total: {counts.total}</span>
                        <span className="text-emerald-600">Tersedia: {counts.available}</span>
                        <span className="text-amber-700">Dipinjam: {counts.borrowed}</span>
                        <span className="text-slate-500">Maintenance: {counts.maintenance}</span>
                        <span className="text-rose-600">Rusak: {counts.damaged}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.condition === 'Baik'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : item.condition === 'Rusak Ringan'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {item.condition === 'Baik' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{item.condition}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {getUnitCounts(item).borrowed > 0 ? (
                        <span className="font-semibold text-[#8C6207] bg-[#FAF2DF] px-2 py-0.5 rounded-md border border-[#F2E0B5]">
                          {getUnitCounts(item).borrowed} unit dipinjam
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openUnitDetail(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                          title="Detail Unit"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Lihat Unit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEquipment(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                        </>
                      );
                    })()}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={editingEquipment ? 'Edit Data Peralatan' : 'Tambah Peralatan Baru'}
        subtitle="Registrasi peralatan teknisi operasional PT Shinmado"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingEquipment ? 'Simpan' : 'Tambahkan Alat'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Peralatan *"
            placeholder="Contoh: Bor Cordless DeWalt 18V"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Jumlah Unit Fisik *"
            type="number"
            min={1}
            value={formData.unitCount}
            onChange={(e) => setFormData({ ...formData, unitCount: Math.max(1, Number(e.target.value) || 1) })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Power Tools">Power Tools</option>
              <option value="Pengukuran">Pengukuran</option>
              <option value="Akses & Keselamatan">Akses & Keselamatan</option>
              <option value="Hand Tools">Hand Tools</option>
              <option value="Fabrikasi">Fabrikasi</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as EquipmentStatus })
                }
                className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kondisi</label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value as EquipmentCondition })
                }
                className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Perlu Servis">Perlu Servis</option>
              </select>
            </div>
          </div>

          <Input
            label="Nomor Seri (Serial Number)"
            placeholder="Contoh: DCD791-2024-098"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan kelengkapan box, mata bor, charger..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {viewingEquipment && (
        <Modal
          isOpen={Boolean(viewingEquipment)}
          onClose={() => setViewingEquipment(null)}
          title={`Detail Unit: ${viewingEquipment.name}`}
          subtitle={`${getUnits(viewingEquipment).length} unit fisik terdaftar`}
          maxWidth="lg"
          footer={<Button variant="secondary" size="sm" onClick={() => setViewingEquipment(null)}>Tutup</Button>}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
            {(['Tersedia', 'Dipinjam', 'Maintenance', 'Rusak'] as EquipmentStatus[]).map((unitStatus) => (
              <div key={unitStatus} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="text-slate-400 block">{unitStatus}</span>
                <strong className="text-lg text-slate-900">{getUnits(viewingEquipment).filter((unit) => unit.status === unitStatus).length}</strong>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-4 space-y-2 text-xs">
            <p className="font-bold text-slate-800">Pinjam unit tersedia</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={selectedUnitId}
                onChange={(event) => setSelectedUnitId(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"
              >
                <option value="">Pilih unit</option>
                {getUnits(viewingEquipment).map((unit) => (
                  <option key={unit.id} value={unit.id} disabled={unit.status !== 'Tersedia'}>
                    {unit.code} - {unit.status === 'Dipinjam' ? `Sedang Dipinjam${unit.currentBorrower ? ` - ${unit.currentBorrower}` : ''}` : unit.status}
                  </option>
                ))}
              </select>
              <select
                value={unitBorrowerId}
                onChange={(event) => setUnitBorrowerId(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"
              >
                <option value="">Pilih teknisi</option>
                {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name}</option>)}
              </select>
              <Input type="date" value={unitReturnDate} onChange={(event) => setUnitReturnDate(event.target.value)} />
            </div>
            <Button
              size="sm"
              variant="primary"
              disabled={!selectedUnitId || !unitBorrowerId || !unitReturnDate || getUnits(viewingEquipment).find((unit) => unit.id === selectedUnitId)?.status !== 'Tersedia'}
              onClick={() => handleUnitBorrow(viewingEquipment, selectedUnitId)}
            >
              Pinjam Unit
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-600">
                <tr>
                  <th className="p-2.5">Kode Unit</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Dipinjam Oleh</th>
                  <th className="p-2.5">Tgl Pinjam</th>
                  <th className="p-2.5">Tgl Kembali</th>
                  <th className="p-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getUnits(viewingEquipment).map((unit) => {
                  const activeLoan = activeLoanForUnit(unit);
                  return (
                  <tr key={unit.id}>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{unit.code}</td>
                    <td className="p-2.5"><Badge status={unit.status} /></td>
                    <td className="p-2.5">{unit.currentBorrower || activeLoan?.borrowerName || '-'}</td>
                    <td className="p-2.5 font-mono">{unit.lastBorrowDate || '-'}</td>
                    <td className="p-2.5 font-mono">{unit.lastReturnDate || '-'}</td>
                    <td className="p-2.5">
                      {activeLoan ? (
                        <Button size="sm" variant="outline" onClick={() => returnLoan(activeLoan.id, new Date().toISOString().slice(0, 10), 'Baik')}>
                          Kembalikan
                        </Button>
                      ) : unit.status === 'Tersedia' ? 'TERSEDIA' : 'TIDAK TERSEDIA'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Riwayat Peminjaman</h4>
            {loans.filter((loan) => loan.equipmentId === viewingEquipment.id).length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada riwayat peminjaman untuk peralatan ini.</p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {loans.filter((loan) => loan.equipmentId === viewingEquipment.id).map((loan) => (
                  <div key={loan.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                    <span className="font-mono font-bold">{loan.unitCode || '-'} · {loan.borrowerName}</span>
                    <span>{loan.borrowDate} → {loan.actualReturnDate || '-'} · {loan.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      <ConfirmationDialog
        isOpen={Boolean(deletingEquipment)}
        onClose={() => setDeletingEquipment(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Peralatan"
        message={
          <span>
            Apakah Anda yakin ingin menghapus alat{' '}
            <strong>{deletingEquipment?.name}</strong> ({deletingEquipment?.id})?
          </span>
        }
      />
    </div>
  );
};
