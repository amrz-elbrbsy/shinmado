import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Calendar,
  User,
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';
import { DocumentationItem } from '../../types';

export const DocumentationPage: React.FC = () => {
  const {
    documentations,
    addDocumentation,
    deleteDocumentation,
    technicians,
    showToast,
  } = useApp();

  const [filterTech, setFilterTech] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<DocumentationItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    technicianName: '',
    technicianId: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    imageUrl: '',
  });

  const filteredDocs = documentations.filter((doc) => {
    if (filterTech !== 'all' && doc.technicianName !== filterTech) return false;
    return true;
  });

  const handleOpenUpload = () => {
    setFormData({
      title: '',
      technicianName: technicians[0]?.name || '',
      technicianId: technicians[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
      description: '',
      imageUrl: '',
    });
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const saved = await addDocumentation({
      ...formData,
    });

    if (saved) setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Galeri & Bukti Pasang
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dokumentasi Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Galeri visual dan bukti hasil pekerjaan pemasangan roller blind tim teknisi PT SHINMADO.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenUpload}
          className="font-bold text-xs shadow-xs"
        >
          + Upload Dokumentasi
        </Button>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Foto Proyek</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{documentations.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Bukti fisik terverifikasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kontributor Teknisi</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{technicians.length} Teknisi</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Aktif mengirim laporan</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Paling Banyak Foto</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">Arwan</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Dokumentasi terlengkap</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Standar QC</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">100% Lolos</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Sudah dicek supervisor</p>
        </div>
      </div>

      {/* FILTER BAR (Filter by teknisi) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Filter Teknisi:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterTech('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTech === 'all'
                    ? 'bg-[#B88710] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({documentations.length})
              </button>
              {technicians.map((t) => {
                const count = documentations.filter((d) => d.technicianName === t.name).length;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilterTech(t.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterTech === t.name
                        ? 'bg-[#B88710] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Menampilkan {filteredDocs.length} foto instalasi
          </span>
        </div>
      </div>

      {/* GALLERY GRID */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Belum Ada Foto Dokumentasi"
          description="Belum ada foto instalasi yang diunggah untuk teknisi ini."
          actionLabel="Upload Dokumentasi Pertama"
          onAction={handleOpenUpload}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col"
            >
              {/* Photo Frame */}
              <div
                onClick={() => setViewingItem(item)}
                className="relative aspect-16/10 bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                  <span className="text-xs text-white flex items-center gap-1.5 font-bold">
                    <Eye className="w-3.5 h-3.5" /> Klik untuk perbesar
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  {item.date}
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar name={item.technicianName} size="xs" />
                    <span className="font-bold text-slate-700">{item.technicianName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocumentation(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus Dokumentasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL (Stage 10: Modal dengan preview gambar, judul, teknisi, tanggal, deskripsi) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Dokumentasi Lapangan"
        subtitle="Simpan bukti foto hasil pemasangan roller blind customer"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadSubmit}>
              Simpan Dokumentasi
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Judul Proyek / Customer *"
            placeholder="Contoh: PT Finansia Inti - Mega Kuningan"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Teknisi *</label>
              <select
                value={formData.technicianName}
                onChange={(e) => {
                  const t = technicians.find((tech) => tech.name === e.target.value);
                  setFormData({
                    ...formData,
                    technicianName: e.target.value,
                    technicianId: t?.id || 'TKN-001',
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
              label="Tanggal Pemasangan *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Keterangan & Spesifikasi *"
            placeholder="Contoh: Roller Blind Dimout 12 Set Ruang Meeting"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Photo URL / Upload Simulator */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              URL Foto / Gambar Hasil Instalasi
            </label>
            <Input
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          {/* Preview Image Box */}
          {formData.imageUrl && (
            <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                Preview Gambar:
              </span>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-36 object-cover rounded-lg"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* VIEW IMAGE LIGHTBOX MODAL */}
      {viewingItem && (
        <Modal
          isOpen={Boolean(viewingItem)}
          onClose={() => setViewingItem(null)}
          title={viewingItem.title}
          subtitle={`Teknisi: ${viewingItem.technicianName} • ${viewingItem.date}`}
          size="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setViewingItem(null)}>
              Tutup
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img
                src={viewingItem.imageUrl}
                alt={viewingItem.title}
                className="w-full max-h-[60vh] object-contain mx-auto"
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <h4 className="font-bold text-slate-900 mb-1">Spesifikasi Pekerjaan</h4>
              <p className="text-slate-600 leading-relaxed">{viewingItem.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
