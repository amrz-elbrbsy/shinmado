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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logoUrl from '../../assets/images/zipblind_logo_transparent.png';

export const ReportsPage: React.FC = () => {
  const { technicians, schedules, installations, targets, materials, showToast, navigate } = useApp();

  const getLocalDateKey = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const monthLabel = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const [period, setPeriod] = useState('month');
  const [selectedTech, setSelectedTech] = useState('all');
  const [reportType, setReportType] = useState('Pemasangan');
  const [isExporting, setIsExporting] = useState(false);

  const completedInstallations = installations.filter((item) => item.status === 'Selesai');
  const totalJobs = schedules.length + installations.length;
  const totalSetsInstalled = installations.reduce((sum, item) => sum + item.completedSets, 0);
  const totalMaterialStock = materials.reduce((sum, item) => sum + item.stock, 0);

  const metrics = [
    {
      label: 'Total Pekerjaan',
      value: String(totalJobs),
      sub: 'Survey & Instalasi',
      icon: <CheckCircle2 className="w-4 h-4 text-[#B88710]" />,
      bg: 'bg-[#FAF2DF] text-[#8C6207]',
    },
    {
      label: 'Total Set Terpasang',
      value: `${totalSetsInstalled} Set`,
      sub: 'Pencapaian target tim',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Rata-rata Rating',
      value: '0 / 5',
      sub: 'Belum ada data rating',
      icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />,
      bg: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Penggunaan Material',
      value: `${totalMaterialStock} Meter`,
      sub: 'Total kain terpasang',
      icon: <Boxes className="w-4 h-4 text-[#B88710]" />,
      bg: 'bg-[#FAF2DF] text-[#8C6207]',
    },
  ];

  const reportRows = [
    ...completedInstallations.map((installation) => ({
      id: installation.id,
      date: installation.startDate,
      technician: installation.technicianName,
      customer: installation.customerName,
      type: 'Pemasangan',
      sets: installation.completedSets,
      fabricUsed: '-',
      rating: 0,
      status: installation.status,
    })),
    ...schedules.map((schedule) => ({
      id: schedule.id,
      date: schedule.date,
      technician: schedule.technicianName,
      customer: schedule.customerName,
      type: schedule.type,
      sets: schedule.setsCount || 0,
      fabricUsed: '-',
      rating: 0,
      status: schedule.status,
    })),
  ];

  const periodLabels: Record<string, string> = {
    today: `Hari Ini (${todayKey})`,
    week: 'Minggu Ini',
    month: `Bulan Ini (${monthLabel})`,
    quarter: `Kuartal ${Math.floor(today.getMonth() / 3) + 1} (${today.getFullYear()})`,
  };
  const getPeriodStart = () => {
    const start = new Date(today);
    if (period === 'today') return todayKey;
    if (period === 'week') {
      start.setDate(today.getDate() - today.getDay());
    } else if (period === 'month') {
      start.setDate(1);
    } else {
      start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
    }
    return getLocalDateKey(start);
  };
  const periodStart = getPeriodStart();
  const materialReportRows = materials.map((material) => ({
    id: material.id,
    date: material.lastRestocked || todayKey,
    technician: '-',
    customer: material.name,
    type: 'Pemakaian Material',
    sets: material.stock,
    fabricUsed: `${material.stock} ${material.unit}`,
    rating: 0,
    status: material.status,
  }));
  const rowsForSelectedReport = reportType === 'Pemakaian Material' ? materialReportRows : reportRows;
  const filteredReportRows = rowsForSelectedReport.filter((row) => {
    if (row.date < periodStart || row.date > todayKey) return false;
    if (selectedTech !== 'all' && row.technician !== selectedTech) return false;
    if (reportType === 'Pemasangan' && row.type !== 'Pemasangan') return false;
    if (reportType === 'Survey' && row.type !== 'Survey') return false;
    return true;
  });

  const formatDateTime = () => new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const downloadLogo = async () => {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleExport = async (format: 'PDF' | 'Excel') => {
    if (filteredReportRows.length === 0) {
      showToast('Export Tidak Tersedia', 'Tidak ada data pada filter laporan yang dipilih.', 'warning');
      return;
    }
    setIsExporting(true);
    try {
      const filename = `Laporan_ZIPLIND_${todayKey}`;
      const filterLabel = `${periodLabels[period]} | Teknisi: ${selectedTech === 'all' ? 'Semua' : selectedTech} | Jenis: ${reportType}`;
      const rows = filteredReportRows.map((row) => [
        row.date, row.technician, row.customer, row.type, row.sets, row.fabricUsed, row.rating, row.status,
      ]);

      if (format === 'Excel') {
        const worksheet = XLSX.utils.aoa_to_sheet([
          ['Laporan Operasional ZIPLIND'],
          ['Periode', periodLabels[period]],
          ['Filter', filterLabel],
          ['Dibuat', formatDateTime()],
          [],
          ['Tanggal', 'Teknisi', 'Customer / Lokasi', 'Pekerjaan', 'Output Set', 'Material Terpakai', 'Rating', 'Status'],
          ...rows,
        ]);
        worksheet['!cols'] = [14, 20, 30, 20, 14, 22, 12, 16].map((wch) => ({ wch }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else {
        const pdf = new jsPDF({ orientation: 'landscape' });
        try {
          const logo = await downloadLogo();
          pdf.addImage(logo, 'PNG', 14, 10, 32, 10);
        } catch {
          // Export remains usable if the optional logo asset cannot be loaded.
        }
        pdf.setTextColor(11, 37, 70);
        pdf.setFontSize(16);
        pdf.text('Laporan Operasional ZIPLIND', 52, 17);
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Periode: ${periodLabels[period]}`, 14, 30);
        pdf.text(`Filter: ${filterLabel}`, 14, 36);
        pdf.text(`Dibuat: ${formatDateTime()}`, 14, 42);
        autoTable(pdf, {
          startY: 48,
          head: [['Tanggal', 'Teknisi', 'Customer / Lokasi', 'Pekerjaan', 'Output Set', 'Material Terpakai', 'Rating', 'Status']],
          body: rows,
          theme: 'grid',
          headStyles: { fillColor: [184, 135, 16] },
          styles: { fontSize: 8, cellPadding: 2.5 },
          didDrawPage: (data) => {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text('PT SHINMADO', 14, pdf.internal.pageSize.height - 8);
            pdf.text(`Halaman ${data.pageNumber}`, pdf.internal.pageSize.width - 32, pdf.internal.pageSize.height - 8);
          },
        });
        pdf.save(`${filename}.pdf`);
      }
      showToast(`Export ${format} Berhasil`, `${filteredReportRows.length} data berhasil diekspor.`, 'success');
    } catch (error) {
      console.error(`Export ${format} gagal`, error);
      showToast(`Export ${format} Gagal`, 'Terjadi kesalahan saat membuat file laporan.', 'error');
    } finally {
      setIsExporting(false);
    }
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
            disabled={isExporting}
            className="font-bold text-xs border-slate-200 hover:bg-slate-50"
          >
            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="font-bold text-xs shadow-xs"
          >
            {isExporting ? 'Menyiapkan...' : 'Export PDF'}
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
              <option value="today">{periodLabels.today}</option>
              <option value="week">{periodLabels.week}</option>
              <option value="month">{periodLabels.month}</option>
              <option value="quarter">{periodLabels.quarter}</option>
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
            <p className="text-xs text-slate-400 mt-0.5">Rincian pekerjaan teknisi periode {periodLabels[period]}</p>
          </div>
          <span className="text-xs font-semibold text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-1 rounded-full">
            {filteredReportRows.length} Catatan Laporan
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
              {filteredReportRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Tidak ada data pada filter laporan ini.</td>
                </tr>
              ) : filteredReportRows.map((row) => (
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
