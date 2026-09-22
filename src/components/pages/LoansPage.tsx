import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Wrench,
  User,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';
import { EquipmentLoan, LoanStatus, EquipmentCondition } from '../../types';

export const LoansPage: React.FC = () => {
  const {
    loans,
    equipment,
    technicians,
    addLoan,
    returnLoan,
    deleteLoan,
    navigate,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');

  // Modals & Drawers
  const [isBorrowDrawerOpen, setIsBorrowDrawerOpen] = useState(false);
  const [returningLoan, setReturningLoan] = useState<EquipmentLoan | null>(null);
  const [viewingLoan, setViewingLoan] = useState<EquipmentLoan | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<EquipmentLoan | null>(null);

  // Form Pinjam state (Stage 8 requirement)
  const [borrowForm, setBorrowForm] = useState({
    equipmentId: equipment[0]?.id || '',
    unitId: equipment[0]?.units?.find((unit) => unit.status === 'Tersedia')?.id || equipment[0]?.units?.[0]?.id || '',
    equipmentName: equipment[0]?.name || '',
    borrowerName: technicians[0]?.name || '',
    technicianId: technicians[0]?.id || '',
    borrowDate: new Date().toISOString().slice(0, 10),
    estimatedReturnDate: '',
    notes: '',
  });

  // Form Pengembalian state (Stage 8 requirement)
  const [returnForm, setReturnForm] = useState({
    returnDate: '2026-09-18',
    returnCondition: 'Baik' as EquipmentCondition,
    notes: '',
  });

  const filteredLoans = loans.filter((loan) => {
    if (filterStatus !== 'all' && loan.status !== filterStatus) return false;
    if (filterTechnician !== 'all' && loan.borrowerName !== filterTechnician) return false;
    return true;
  });

  const handleOpenBorrow = () => {
    const avail = equipment.find((e) => e.units?.some((unit) => unit.status === 'Tersedia')) || equipment[0];
    const availUnit = avail?.units?.find((unit) => unit.status === 'Tersedia') || avail?.units?.[0];
    setBorrowForm({
      equipmentId: avail?.id || '',
      unitId: availUnit?.id || '',
      equipmentName: avail?.name || '',
      borrowerName: technicians[0]?.name || '',
      technicianId: technicians[0]?.id || '',
      borrowDate: new Date().toISOString().slice(0, 10),
      estimatedReturnDate: '',
      notes: '',
    });
    setIsBorrowDrawerOpen(true);
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowForm.equipmentId || !borrowForm.borrowerName) return;

    const created = addLoan({
      equipmentId: borrowForm.equipmentId,
      unitId: borrowForm.unitId,
      unitCode: equipment.find((item) => item.id === borrowForm.equipmentId)?.units?.find((unit) => unit.id === borrowForm.unitId)?.code,
      equipmentName: borrowForm.equipmentName,
      borrowerName: borrowForm.borrowerName,
      technicianId: borrowForm.technicianId,
      borrowDate: borrowForm.borrowDate,
      borrowedAt: new Date(`${borrowForm.borrowDate}T00:00:00`).toISOString(),
      estimatedReturnDate: borrowForm.estimatedReturnDate,
      status: 'Dipinjam',
      notes: borrowForm.notes,
    });

    if (created) setIsBorrowDrawerOpen(false);
  };

  const handleOpenReturn = (loan: EquipmentLoan) => {
    setReturningLoan(loan);
    setReturnForm({
      returnDate: new Date().toISOString().slice(0, 10),
      returnCondition: 'Baik',
      notes: '',
    });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;

    returnLoan(
      returningLoan.id,
      returnForm.returnDate,
      returnForm.returnCondition,
      returnForm.notes
    );

    setReturningLoan(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Sirkulasi Alat
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Peminjaman Alat</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Pencatatan sirkulasi, peminjaman aktif, dan pengembalian alat instalasi teknisi PT SHINMADO.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            leftIcon={<Wrench className="w-4 h-4" />}
            onClick={() => navigate('peralatan')}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Daftar Peralatan
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenBorrow}
            className="font-bold text-xs shadow-xs"
          >
            + Pinjam Alat
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Transaksi</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{loans.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua riwayat peminjaman</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sedang Dipinjam</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#8C6207] mt-2">
            {loans.filter((l) => l.status === 'Dipinjam').length}
          </p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Berada di teknisi lapangan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sudah Dikembalikan</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {loans.filter((l) => l.status === 'Dikembalikan').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Kembali di workshop aman</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Terlambat</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {loans.filter((l) => l.status === 'Terlambat').length}
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Melewati batas estimasi</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Status Peminjaman
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Dikembalikan">Dikembalikan</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>

          <div className="w-64">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Teknisi Peminjam
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
        </div>
      </div>

      {/* LOANS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">ID Pinjam</th>
                <th className="py-3.5 px-6">Nama Alat</th>
                <th className="py-3.5 px-6">Peminjam</th>
                <th className="py-3.5 px-6">Tgl Pinjam</th>
                <th className="py-3.5 px-6">Tgl Kembali / Estimasi</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      title="Belum Ada Peminjaman"
                      description="Tidak ada data riwayat peminjaman alat yang sesuai filter."
                      actionLabel="Pinjam Alat Sekarang"
                      onAction={handleOpenBorrow}
                    />
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{loan.id}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-bold block">{loan.equipmentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{loan.unitCode || loan.equipmentCode || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <Avatar name={loan.borrowerName} size="xs" />
                        <span className="font-semibold text-slate-800">{loan.borrowerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 text-[11px]">
                      {loan.borrowDate}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px]">
                      {loan.actualReturnDate ? (
                        <span className="text-emerald-700 font-semibold">
                          {loan.actualReturnDate} (Kembali)
                        </span>
                      ) : (
                        <span
                          className={
                            loan.status === 'Terlambat'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-600'
                          }
                        >
                          {loan.estimatedReturnDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={loan.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {loan.status === 'Dipinjam' || loan.status === 'Terlambat' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenReturn(loan)}
                          >
                            Kembalikan
                          </Button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setViewingLoan(loan)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                          title="Detail Peminjaman"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLoan(loan)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Catatan"
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

      {/* FORM PINJAM (Stage 8 requirement: Pilih Alat, Pilih Teknisi, Tanggal Pinjam, Estimasi Kembali, Catatan) */}
      <Modal
        isOpen={isBorrowDrawerOpen}
        onClose={() => setIsBorrowDrawerOpen(false)}
        title="Form Peminjaman Alat"
        subtitle="Registrasi peminjaman inventaris oleh teknisi lapangan"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsBorrowDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleBorrowSubmit}>
              Konfirmasi Peminjaman
            </Button>
          </>
        }
      >
        <form onSubmit={handleBorrowSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Alat *
            </label>
            <select
              value={borrowForm.equipmentId}
              onChange={(e) => {
                const found = equipment.find((eq) => eq.id === e.target.value);
                const firstAvailableUnit = found?.units?.find((unit) => unit.status === 'Tersedia');
                setBorrowForm({
                  ...borrowForm,
                  equipmentId: e.target.value,
                  unitId: firstAvailableUnit?.id || '',
                  equipmentName: found?.name || '',
                });
              }}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.units?.filter((unit) => unit.status === 'Tersedia').length || 0} tersedia)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Unit Fisik *
            </label>
            <select
              required
              value={borrowForm.unitId}
              onChange={(e) => setBorrowForm({ ...borrowForm, unitId: e.target.value })}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              {(equipment.find((item) => item.id === borrowForm.equipmentId)?.units || []).map((unit) => (
                <option key={unit.id} value={unit.id} disabled={unit.status !== 'Tersedia'}>
                  {unit.code} ({unit.status === 'Dipinjam' ? `Sedang Dipinjam${unit.currentBorrower ? ` - ${unit.currentBorrower}` : ''}` : unit.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Teknisi Peminjam *
            </label>
            <select
              value={borrowForm.borrowerName}
              onChange={(e) => {
                const found = technicians.find((t) => t.name === e.target.value);
                setBorrowForm({
                  ...borrowForm,
                  borrowerName: e.target.value,
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
              label="Tanggal Pinjam *"
              type="date"
              value={borrowForm.borrowDate}
              onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
              required
            />
            <Input
              label="Estimasi Kembali *"
              type="date"
              value={borrowForm.estimatedReturnDate}
              onChange={(e) =>
                setBorrowForm({ ...borrowForm, estimatedReturnDate: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan</label>
            <textarea
              rows={3}
              value={borrowForm.notes}
              onChange={(e) => setBorrowForm({ ...borrowForm, notes: e.target.value })}
              placeholder="Contoh: Pemasangan proyek gedung Wisma Sudirman..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {/* FORM PENGEMBALIAN (Stage 8 requirement: Tanggal Kembali, Kondisi alat saat kembali (Baik/Rusak), Catatan) */}
      <Modal
        isOpen={Boolean(returningLoan)}
        onClose={() => setReturningLoan(null)}
        title="Form Pengembalian Alat"
        subtitle={`Pengembalian: ${returningLoan?.equipmentName}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setReturningLoan(null)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleReturnSubmit}>
              Simpan Pengembalian
            </Button>
          </>
        }
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Input
            label="Tanggal Kembali *"
            type="date"
            value={returnForm.returnDate}
            onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kondisi Alat Saat Kembali *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Baik', 'Rusak Ringan', 'Perlu Servis'] as EquipmentCondition[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, returnCondition: cond })}
                  className={`py-2 px-2 text-xs rounded-xl border font-medium transition-all ${
                    returnForm.returnCondition === cond
                      ? 'bg-[#FAF2DF] text-[#8C6207] border-[#B88710] font-bold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Pengembalian
            </label>
            <textarea
              rows={3}
              value={returnForm.notes}
              onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
              placeholder="Catatan kebersihan alat, baterai terisi, kelengkapan..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      {viewingLoan && (
        <Modal
          isOpen={Boolean(viewingLoan)}
          onClose={() => setViewingLoan(null)}
          title={`Detail Peminjaman: ${viewingLoan.id}`}
          subtitle={viewingLoan.equipmentName}
          maxWidth="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setViewingLoan(null)}>
              Tutup
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-700">Status Peminjaman</span>
              <Badge status={viewingLoan.status} />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-slate-400">Teknisi Peminjam</span>
              <p className="text-sm font-bold text-slate-900">{viewingLoan.borrowerName}</p>
              <p className="text-[11px] text-slate-500 font-mono">Unit: {viewingLoan.unitCode || viewingLoan.equipmentCode || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <span className="text-slate-400">Tanggal Pinjam</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {viewingLoan.borrowDate}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-white">
                <span className="text-slate-400">Estimasi Kembali</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {viewingLoan.estimatedReturnDate}
                </p>
              </div>
            </div>

            {viewingLoan.actualReturnDate && (
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <span className="text-emerald-800 font-semibold block">
                  Dikembalikan pada: {viewingLoan.actualReturnDate}
                </span>
                <span className="text-emerald-700 text-[11px] block mt-0.5">
                  Kondisi saat kembali: <strong>{viewingLoan.returnCondition || 'Baik'}</strong>
                </span>
              </div>
            )}

            {viewingLoan.notes && (
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400">Catatan</span>
                <p className="text-slate-600">{viewingLoan.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE */}
      <ConfirmationDialog
        isOpen={Boolean(deletingLoan)}
        onClose={() => setDeletingLoan(null)}
        onConfirm={() => {
          if (deletingLoan) {
            deleteLoan(deletingLoan.id);
            setDeletingLoan(null);
          }
        }}
        title="Hapus Catatan Peminjaman"
        message={<span>Hapus catatan peminjaman ID {deletingLoan?.id}?</span>}
      />
    </div>
  );
};
