import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Star,
  Printer,
  Table as TableIcon,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';

export const ReportsPage: React.FC = () => {
  const { technicians, showToast, navigate } = useApp();

  const [period, setPeriod] = useState('Bulan Ini (September 2026)');
  const [selectedTech, setSelectedTech] = useState('all');
  const [reportType, setReportType] = useState('Pemasangan');

  // Summary Metrics (Stage 10 requirements: Total Pekerjaan: 48, Total Set Terpasang: 180 Set, Rata-rata Rating: 4.8 / 5, Penggunaan Material: 240 Meter Kain)
  const metrics = [
    {
      label: 'Total Pekerjaan',
      value: '48',
      sub: 'Survey & Instalasi',
      icon: <CheckCircle2 className="w-4 h-4 text-[#B88710]" />,
      bg: 'bg-[#FAF2DF] text-[#8C6207]',
    },
    {
      label: 'Total Set Terpasang',
      value: '180 Set',
      sub: 'Pencapaian target tim',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Rata-rata Rating',
      value: '4.8 / 5',
      sub: 'Kepuasan customer',
      icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />,
      bg: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Penggunaan Material',
      value: '240 Meter',
      sub: 'Total kain terpasang',
      icon: <Boxes className="w-4 h-4 text-[#B88710]" />,
      bg: 'bg-[#FAF2DF] text-[#8C6207]',
    },
  ];

  // Realistic Operational Report Summary Rows
  const reportRows = [
    {
      id: 'REP-01',
      date: '18 Sep 2026',
      technician: 'Arwan',
      customer: 'PT Multidaya Prima (Sudirman)',
      type: 'Pemasangan',
      sets: 14,
      fabricUsed: '32 Meter (Dimout Grey)',
      rating: 5.0,
      status: 'Selesai',
    },
    {
      id: 'REP-02',
      date: '18 Sep 2026',
      technician: 'Rehan',
      customer: 'Keluarga Bpk. Hendra (Puri Indah)',
      type: 'Pemasangan',
      sets: 12,
      fabricUsed: '28 Meter (Blackout White)',
      rating: 4.9,
      status: 'Selesai',
    },
    {
      id: 'REP-03',
      date: '17 Sep 2026',
      technician: 'Asep',
      customer: 'Wisma Mandiri Lt. 12',
      type: 'Pemasangan',
      sets: 18,
      fabricUsed: '45 Meter (Solar Screen 3%)',
      rating: 4.8,
      status: 'Selesai',
    },
    {
      id: 'REP-04',
      date: '17 Sep 2026',
      technician: 'Fajar',
      customer: 'Resto Kayu Manis BSD',
      type: 'Pemasangan',
      sets: 8,
      fabricUsed: '20 Meter (Dimout Beige)',
      rating: 4.7,
      status: 'Selesai',
    },
    {
      id: 'REP-05',
      date: '16 Sep 2026',
      technician: 'Arwan',
      customer: 'Kantor Notaris Siska SH',
      type: 'Survey & Pengukuran',
      sets: 6,
      fabricUsed: 'Survey Akurasi Laser',
      rating: 5.0,
      status: 'Selesai',
    },
  ];

  const handleExport = (format: 'PDF' | 'Excel') => {
    showToast(
      `Export ${format} Berhasil`,
      `Laporan operasional teknisi periode ${period} telah siap diunduh.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Analisis & Pelaporan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Laporan Operasional</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Analisis produktivitas teknisi, pemakaian material, dan rekapitulasi pemasangan roller blind PT SHINMADO.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
            onClick={() => handleExport('Excel')}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => handleExport('PDF')}
            className="font-bold text-xs shadow-xs"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{item.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.bg}`}>
                {item.icon}
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {item.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* FILTER BAR (Periode, Teknisi, Jenis Laporan) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Periode Laporan
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="Hari Ini (18 Sep 2026)">Hari Ini (18 Sep 2026)</option>
              <option value="Minggu Ini (14 - 20 Sep 2026)">Minggu Ini (14 - 20 Sep 2026)</option>
              <option value="Bulan Ini (September 2026)">Bulan Ini (September 2026)</option>
              <option value="Kuartal 3 (Juli - Sep 2026)">Kuartal 3 (Juli - Sep 2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Filter Teknisi
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Teknisi</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="Pemasangan">Pemasangan & Instalasi</option>
              <option value="Survey">Survey & Pengukuran</option>
              <option value="Pemakaian Material">Pemakaian Material & Kain</option>
            </select>
          </div>
        </div>
      </div>

      {/* REKAPITULASI TABEL LAPORAN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Operasional Lapangan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rincian pekerjaan teknisi periode {period}</p>
          </div>
          <span className="text-xs font-semibold text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-1 rounded-full">
            {reportRows.length} Catatan Laporan
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">Tanggal</th>
                <th className="py-3.5 px-6">Teknisi</th>
                <th className="py-3.5 px-6">Customer / Lokasi</th>
                <th className="py-3.5 px-6">Pekerjaan</th>
                <th className="py-3.5 px-6">Output Set</th>
                <th className="py-3.5 px-6">Material Terpakai</th>
                <th className="py-3.5 px-6 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {reportRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-[11px] text-slate-600">{row.date}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">{row.technician}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">{row.customer}</td>
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-[#8C6207]">{row.sets} Set</td>
                  <td className="py-3.5 px-6 font-mono text-slate-600 text-[11px]">
                    {row.fabricUsed}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {row.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
