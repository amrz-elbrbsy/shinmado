import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  Package,
  Layers,
  Edit2,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { Material, StockStatus } from '../../types';

export const MaterialsPage: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    stock: number;
    unit: string;
    minStock: number;
    notes: string;
  }>({
    name: '',
    category: 'Kain Blind',
    stock: 0,
    unit: 'Meter',
    minStock: 0,
    notes: '',
  });

  const categories = Array.from(new Set(materials.map((m) => m.category)));
  const lowStockItems = materials.filter((m) => m.status === 'Menipis' || m.status === 'Habis');

  const filteredMaterials = materials.filter((item) => {
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      category: 'Kain Blind',
      stock: 0,
      unit: 'Meter',
      minStock: 0,
      notes: '',
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenEdit = (item: Material) => {
    setEditingMaterial(item);
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      notes: item.notes || '',
    });
    setIsAddDrawerOpen(true);
  };

  const calculateStatus = (stock: number, minStock: number): StockStatus => {
    if (stock <= 0) return 'Habis';
    if (stock <= minStock) return 'Menipis';
    return 'Aman';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const autoStatus = calculateStatus(formData.stock, formData.minStock);

    const saved = editingMaterial
      ? await updateMaterial(editingMaterial.id, {
        ...formData,
        status: autoStatus,
        })
      : await addMaterial({
        ...formData,
        status: autoStatus,
        });
    if (saved) setIsAddDrawerOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingMaterial) {
      if (await deleteMaterial(deletingMaterial.id)) setDeletingMaterial(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Inventaris Logistik
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Material & Sparepart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Manajemen stok kain roller blind, tabung, bracket, rantai kontrol, dan komponen mekanik ZIPBLIND.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => navigate('maintenance')}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Maintenance Alat
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="font-bold text-xs shadow-xs"
          >
            + Tambah Material
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Material</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{materials.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">SKU barang terdata</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Stok Aman</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {materials.filter((m) => m.status === 'Aman').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Item kuota optimal</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Stok Menipis</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{lowStockItems.length}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Perlu restock segera</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kategori Bahan</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#8C6207] mt-2">{categories.length}</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Kelompok komponen</p>
        </div>
      </div>

      {/* ALERT / WARNING CARD */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950">
                Peringatan Restock: {lowStockItems.length} Material Menipis
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                Stok bahan berikut berada di bawah batas minimum:{' '}
                <strong>{lowStockItems.map((m) => m.name).join(', ')}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterStatus('Menipis')}
            className="text-xs font-bold text-rose-700 bg-white hover:bg-rose-100/60 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Filter Menipis
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari material atau sparepart..."
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] transition-all placeholder:text-slate-400"
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
              <option value="all">Semua Status Stok</option>
              <option value="Aman">Stok Aman</option>
              <option value="Menipis">Stok Menipis</option>
              <option value="Habis">Stok Habis</option>
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
                <th className="py-3.5 px-6">Nama Material & Sparepart</th>
                <th className="py-3.5 px-6">Kategori</th>
                <th className="py-3.5 px-6">Stok Saat Ini</th>
                <th className="py-3.5 px-6">Batas Minimum</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <EmptyState
                      title="Material Tidak Ditemukan"
                      description="Tidak ada item yang sesuai dengan filter atau kata kunci."
                    />
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 text-sm">{item.stock}</span>
                      <span className="text-slate-400 ml-1 font-medium">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#8C6207] hover:bg-[#FAF2DF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMaterial(item)}
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

      {/* FORM MODAL (Nama, Kategori, Stok saat ini, Satuan, Batas minimum stok, Status otomatis) */}
      <Modal
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={editingMaterial ? 'Edit Data Material' : 'Tambah Material Baru'}
        subtitle="Kelola stok material dan komponen roller blind PT Shinmado"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddDrawerOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingMaterial ? 'Simpan' : 'Tambahkan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Material *"
            placeholder="Contoh: Kain Dimout Grey 250cm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            >
              <option value="Kain Blind">Kain Blind</option>
              <option value="Hardware & Rel">Hardware & Rel</option>
              <option value="Aksesoris & Mekanik">Aksesoris & Mekanik</option>
              <option value="Motorized & Smart">Motorized & Smart</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Stok Saat Ini *"
              type="number"
              min={0}
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })
              }
              required
            />
            <Input
              label="Satuan *"
              placeholder="Meter, Batang, Pcs, Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>

          <Input
            label="Batas Minimum Stok *"
            type="number"
            min={1}
            value={formData.minStock}
            onChange={(e) =>
              setFormData({ ...formData, minStock: parseFloat(e.target.value) || 1 })
            }
            required
          />

          {/* Status Otomatis Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Status Otomatis:</span>
            <Badge status={calculateStatus(formData.stock, formData.minStock)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Supplier, kode batch kain, rak penyimpanan..."
              className="w-full text-xs bg-white text-slate-800 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmationDialog
        isOpen={Boolean(deletingMaterial)}
        onClose={() => setDeletingMaterial(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Material"
        message={<span>Hapus {deletingMaterial?.name} dari daftar stok?</span>}
      />
    </div>
  );
};
