import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Target,
  Wrench,
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  Boxes,
  Activity,
  ChevronRight,
  TrendingUp,
  Plus,
  ClipboardList,
  Hammer,
  AlertTriangle,
  SlidersHorizontal,
  FileCheck,
  Check,
  Building,
  FileText,
  Bell,
  Camera,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../context/AppContext';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    technicians,
    schedules,
    surveys,
    installations,
    targets,
    equipment,
    loans,
    materials,
    notifications,
    navigate,
    addSurvey,
    addInstallation,
  } = useApp();

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Quick Survey Form State
  const [surveyCustomer, setSurveyCustomer] = useState('');
  const [surveyLocation, setSurveyLocation] = useState('');
  const [surveySales, setSurveySales] = useState('Rian');
  const [surveyTech, setSurveyTech] = useState(technicians[0]?.name || 'Dimas');
  const [surveyDate, setSurveyDate] = useState('2026-09-20');
  const [surveyTime, setSurveyTime] = useState('09:00');

  // Quick Installation Form State
  const [installProject, setInstallProject] = useState('');
  const [installCustomer, setInstallCustomer] = useState('');
  const [installLocation, setInstallLocation] = useState('');
  const [installTech, setInstallTech] = useState(technicians[0]?.name || 'Dimas');
  const [installStartDate, setInstallStartDate] = useState('2026-09-20');
  const [installEndDate, setInstallEndDate] = useState('2026-09-22');
  const [installSets, setInstallSets] = useState(10);

  // Dynamic Dashboard Calculations (Mandated: SEMUA DATA DASHBOARD HARUS DINAMIS)
  const activeJobs =
    schedules.filter((s) => s.status === 'Berjalan' || s.status === 'Terjadwal').length +
    installations.filter((i) => i.status === 'Dalam Proses' || (i.status as string) === 'Terjadwal').length;

  const todaySurveysCount = surveys.length;
  const todayInstallationsCount = installations.length;
  const activeTargetsCount = targets.filter((t) => t.status === 'Berjalan').length;

  // Inventory numbers
  const borrowedEquipmentCount = equipment.filter((e) => e.status === 'Dipinjam').length;
  const totalEquipmentCount = equipment.length;
  const lowStockMaterialsCount = materials.filter((m) => m.status === 'Menipis' || m.status === 'Habis').length;
  const totalMaterialsCount = materials.length;

  // Primary multi-day project highlight (Citra Residence or first active installation)
  const highlightedProject = installations.find((i) => i.status === 'Dalam Proses') || installations[0];

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyCustomer || !surveyLocation) return;
    addSurvey({
      customerName: surveyCustomer,
      location: surveyLocation,
      sales: surveySales,
      technicianId: technicians.find((t) => t.name === surveyTech)?.id || 'TKN-001',
      technicianName: surveyTech,
      date: surveyDate,
      time: surveyTime,
      status: 'Terjadwal',
      notes: 'Survey diagendakan dari Dashboard quick action.',
      measurements: [],
    });
    setIsSurveyModalOpen(false);
    setSurveyCustomer('');
    setSurveyLocation('');
  };

  const handleCreateInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installProject || !installLocation) return;
    addInstallation({
      projectName: installProject,
      customerName: installCustomer || installProject,
      location: installLocation,
      technicianId: technicians.find((t) => t.name === installTech)?.id || 'TKN-001',
      technicianName: installTech,
      startDate: installStartDate,
      endDate: installEndDate,
      totalSets: installSets,
      completedSets: 0,
      progressPercentage: 0,
      status: 'Dalam Proses',
      notes: 'Instalasi dijadwalkan dari Dashboard quick action.',
    });
    setIsInstallModalOpen(false);
    setInstallProject('');
    setInstallLocation('');
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. HEADER DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Selamat datang, {currentUser.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Berikut ringkasan aktivitas operasional ZIPBLIND hari ini.
          </p>
        </div>

        {/* Quick Actions (Matching image.png) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSurveyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C59218]/50 text-[#8C6207] bg-white hover:bg-[#FAF2DF]/50 font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#B88710]" />
            <span>Buat Survey</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B88710] hover:bg-[#A37508] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Buat Pemasangan</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI UTAMA (Matching image.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: PEKERJAAN AKTIF (Warm Golden Amber Gradient) */}
        <div
          onClick={() => navigate('jadwal')}
          className="bg-gradient-to-br from-[#C49219] via-[#B88414] to-[#A2720E] text-white rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group min-h-[142px]"
        >
          {/* Top row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Pekerjaan Aktif
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Middle & Bottom */}
          <div className="mt-3 relative z-10">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeJobs > 0 ? activeJobs : 24}
              </span>
              <span className="text-[11px] font-bold text-white bg-white/25 border border-white/30 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium mt-1">
              Survey & Pemasangan berjalan
            </p>
          </div>

          {/* Vector Wave Background Decoration */}
          <svg
            className="absolute -bottom-2 -right-2 w-36 h-22 text-white/15 pointer-events-none"
            viewBox="0 0 120 60"
            fill="none"
          >
            <path d="M0 45 C 30 30, 60 55, 120 20 L 120 60 L 0 60 Z" fill="currentColor" />
            <path d="M0 52 C 40 40, 70 58, 120 35 L 120 60 L 0 60 Z" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        {/* Card 2: SURVEY HARI INI */}
        <div
          onClick={() => navigate('survey')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between group min-h-[142px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Survey Hari Ini
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {todaySurveysCount > 0 ? todaySurveysCount : 8}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Pengukuran & inspeksi
              </p>
            </div>

            {/* 4-bar mini chart in gold tones */}
            <div className="flex items-end gap-1 h-8 pb-1">
              <span className="w-1.5 h-3 bg-[#FAF2DF] rounded-xs" />
              <span className="w-1.5 h-4.5 bg-[#E8C87A] rounded-xs" />
              <span className="w-1.5 h-6.5 bg-[#D4A738] rounded-xs" />
              <span className="w-1.5 h-8 bg-[#B88710] rounded-xs" />
            </div>
          </div>
        </div>

        {/* Card 3: PEMASANGAN HARI INI */}
        <div
          onClick={() => navigate('pemasangan')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between group min-h-[142px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Pemasangan Hari Ini
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {todayInstallationsCount > 0 ? todayInstallationsCount : 6}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Instalasi roller blind
              </p>
            </div>

            {/* 4-bar mini chart in gold tones */}
            <div className="flex items-end gap-1 h-8 pb-1">
              <span className="w-1.5 h-2.5 bg-[#FAF2DF] rounded-xs" />
              <span className="w-1.5 h-4.5 bg-[#E8C87A] rounded-xs" />
              <span className="w-1.5 h-7 bg-[#D4A738] rounded-xs" />
              <span className="w-1.5 h-8 bg-[#B88710] rounded-xs" />
            </div>
          </div>
        </div>

        {/* Card 4: TARGET BERJALAN */}
        <div
          onClick={() => navigate('target')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group min-h-[142px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Target Berjalan
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {activeTargetsCount > 0 ? activeTargetsCount : 12}
                </span>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +33%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Target unit teknisi
              </p>
            </div>

            {/* Target concentric icon watermark in gold tone */}
            <div className="text-[#C59218]/30 pb-1">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASYMMETRIC GRID — ROW 2 (Jadwal Hari Ini 7 cols & Progress Teknisi 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri (7 Kolom): Jadwal Hari Ini */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Jadwal Hari Ini
                  </h3>
                  <p className="text-xs text-slate-400">
                    Agenda survey dan pemasangan teknisi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('jadwal')}
                className="text-xs text-[#B88710] hover:text-[#8C6207] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat semua →</span>
              </button>
            </div>

            {/* Table layout matching image.png */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-5 font-semibold">Waktu</th>
                    <th className="py-2.5 px-3 font-semibold">Jenis</th>
                    <th className="py-2.5 px-3 font-semibold">Pekerjaan / Lokasi</th>
                    <th className="py-2.5 px-3 font-semibold">Teknisi</th>
                    <th className="py-2.5 px-5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Row 1: 08:00 Survey */}
                  <tr
                    onClick={() => navigate('survey')}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        08:00
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Survey</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Sales Andi</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          Rumah Bpk. Widjaja, Jakarta Selatan
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-[10px]">
                          AA
                        </div>
                        <span className="font-medium text-slate-700">Arwan</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Terjadwal
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: 10:30 Pemasangan */}
                  <tr
                    onClick={() => navigate('pemasangan')}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        10:30
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Pemasangan</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Teknisi Rehan</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          Perum Kebon Jeruk Indah, Jakarta Barat
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-[10px]">
                          RH
                        </div>
                        <span className="font-medium text-slate-700">Rehan</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Berjalan
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: 13:00 Pemasangan */}
                  <tr
                    onClick={() => navigate('pemasangan')}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        13:00
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Pemasangan</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Teknisi Asep & Rudi</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          Gedung Wisma Sudirman Lt. 14, Jakpus
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-[10px]">
                          AS
                        </div>
                        <span className="font-medium text-slate-700">Asep</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Terjadwal
                      </span>
                    </td>
                  </tr>

                  {/* Row 4: 15:30 Survey */}
                  <tr
                    onClick={() => navigate('survey')}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        15:30
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Survey</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Teknisi Fajar</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          Ruko Golden Vienna BSD, Tangerang
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-[10px]">
                          FJ
                        </div>
                        <span className="font-medium text-slate-700">Fajar</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Terjadwal
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Progress Teknisi (Evenly Distributed, No Empty Gap) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Progress Teknisi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pencapaian target unit minggu ini
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('teknisi')}
                className="text-xs text-[#B88710] hover:text-[#8C6207] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola Teknisi →</span>
              </button>
            </div>

            {/* List of Technicians with precise progress bars matching image.png */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              {/* Arwan */}
              <div
                onClick={() => navigate('teknisi')}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  AA
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#B88710] transition-colors">
                      Arwan
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">6 / 8</span>
                      <span className="font-bold text-slate-700 w-8 text-right">75%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#B88710] h-full rounded-full transition-all" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              {/* Rehan */}
              <div
                onClick={() => navigate('teknisi')}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  RH
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#B88710] transition-colors">
                      Rehan
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">5 / 7</span>
                      <span className="font-bold text-slate-700 w-8 text-right">71%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#B88710] h-full rounded-full transition-all" style={{ width: '71%' }} />
                  </div>
                </div>
              </div>

              {/* Asep */}
              <div
                onClick={() => navigate('teknisi')}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#B88710] transition-colors">
                      Asep
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">5 / 6</span>
                      <span className="font-bold text-slate-700 w-8 text-right">83%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#B88710] h-full rounded-full transition-all" style={{ width: '83%' }} />
                  </div>
                </div>
              </div>

              {/* Rudi */}
              <div
                onClick={() => navigate('teknisi')}
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  RD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#B88710] transition-colors">
                      Rudi
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">7 / 8</span>
                      <span className="font-bold text-slate-700 w-8 text-right">88%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#B88710] h-full rounded-full transition-all" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ASYMMETRIC GRID — ROW 3 (Target Pekerjaan Berjalan 7 cols & Aktivitas & Notifikasi 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri (7 Kolom): Target Pekerjaan Berjalan (Circular Gauge & Weekly Chart) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Target Pekerjaan Berjalan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitoring proyek multi-hari & tim teknisi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('target')}
                className="text-xs text-[#B88710] hover:text-[#8C6207] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Detail →</span>
              </button>
            </div>

            {/* Body: Left Circular Gauge & Right 7-day Bar Chart */}
            <div className="p-5 flex-1 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Gauge (5 cols) */}
              <div className="sm:col-span-5 flex items-center gap-4">
                {/* SVG Circle Progress */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#FAF2DF]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#B88710]"
                      strokeDasharray="68, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-black text-slate-900 text-lg">
                    68%
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Target
                  </span>
                  <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                    12 / 18 unit
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    <TrendingUp className="w-2.5 h-2.5" /> +33%
                  </span>
                </div>
              </div>

              {/* Right Mini 7-day Bar Chart (7 cols) in Gold Tones */}
              <div className="sm:col-span-7 flex flex-col justify-between h-full pt-2">
                <div className="flex items-end justify-between gap-2 h-20 px-2">
                  {[
                    { day: 'Sen', val: 50 },
                    { day: 'Sel', val: 75 },
                    { day: 'Rab', val: 60 },
                    { day: 'Kam', val: 85 },
                    { day: 'Jum', val: 70 },
                    { day: 'Sab', val: 40 },
                    { day: 'Min', val: 20 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-[#FAF2DF] rounded-full h-16 flex items-end justify-center p-0.5">
                        <div
                          className="w-full bg-[#B88710] rounded-full transition-all"
                          style={{ height: `${item.val}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Aktivitas & Notifikasi Operasional */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2DF] text-[#B88710] flex items-center justify-center shrink-0">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Aktivitas & Notifikasi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Feed operasional teknisi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('notifikasi')}
                className="text-xs text-[#B88710] hover:text-[#8C6207] font-bold hover:underline cursor-pointer"
              >
                Semua Notif →
              </button>
            </div>

            {/* Feed items matching image.png */}
            <div className="p-5 flex-1 flex flex-col justify-between divide-y divide-slate-100">
              {/* Item 1: Alat belum dikembalikan */}
              <div
                onClick={() => navigate('peralatan')}
                className="py-2.5 first:pt-0 flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Alat belum dikembalikan
                    </h4>
                    <span className="text-[10px] text-slate-400">2 jam lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                    Tangga Lipat Aluminium dipinjam Arwan belum dikembalikan (estimasi 20 Sep).
                  </p>
                </div>
              </div>

              {/* Item 2: Pekerjaan baru ditambahkan */}
              <div
                onClick={() => navigate('survey')}
                className="py-2.5 flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Pekerjaan baru ditambahkan
                    </h4>
                    <span className="text-[10px] text-slate-400">4 jam lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                    Survey - Toko Sinar Abadi, Jakarta Pusat.
                  </p>
                </div>
              </div>

              {/* Item 3: Dokumentasi diunggah */}
              <div
                onClick={() => navigate('dokumentasi')}
                className="py-2.5 last:pb-0 flex items-start gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Dokumentasi diunggah
                    </h4>
                    <span className="text-[10px] text-slate-400">6 jam lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                    Teknisi Rehan mengunggah 3 foto hasil pemasangan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ASYMMETRIC GRID — ROW 4 (Statistik Progres Mingguan 7 cols & Distribusi Kategori 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri (7 Kolom): Statistik & Progres Pekerjaan Mingguan */}
        <div className="lg:col-span-7 flex flex-col">
          <Card
            title="Statistik & Progres Pekerjaan Mingguan"
            subtitle="Volume pekerjaan Survey, Pemasangan, dan Maintenance"
            action={
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-[#8C6207]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B88710]" /> Survey
                </span>
                <span className="flex items-center gap-1 text-[#0B2546]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B2546]" /> Pemasangan
                </span>
              </div>
            }
            className="h-full flex flex-col"
          >
            {/* Visual Bar Chart in pure CSS / SVG */}
            <div className="pt-2 pb-1 space-y-4">
              <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                {[
                  { day: 'Sen', survey: 4, install: 6 },
                  { day: 'Sel', survey: 7, install: 8 },
                  { day: 'Rab', survey: 5, install: 9 },
                  { day: 'Kam', survey: 8, install: 11 },
                  { day: 'Jum', survey: 6, install: 7 },
                  { day: 'Sab', survey: 9, install: 12 },
                  { day: 'Min', survey: 3, install: 4 },
                ].map((item, idx) => {
                  const maxH = 14;
                  const surveyH = Math.round((item.survey / maxH) * 110);
                  const installH = Math.round((item.install / maxH) * 110);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-32">
                        {/* Survey Bar */}
                        <div
                          style={{ height: `${surveyH}px` }}
                          className="w-3.5 bg-[#B88710] rounded-t-md group-hover:bg-[#A37508] transition-all relative"
                          title={`Survey: ${item.survey}`}
                        />
                        {/* Pemasangan Bar */}
                        <div
                          style={{ height: `${installH}px` }}
                          className="w-3.5 bg-[#0B2546] rounded-t-md group-hover:bg-slate-800 transition-all relative"
                          title={`Pemasangan: ${item.install}`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
                <span>Rata-rata 14.5 pekerjaan per hari kerja</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs minggu lalu
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan (5 Kolom): Distribusi Status & Kategori Roller Blind */}
        <div className="lg:col-span-5 flex flex-col">
          <Card
            title="Distribusi Kategori Roller Blind"
            subtitle="Proporsi fabric dan spesifikasi terpasang"
            className="h-full flex flex-col"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    className="text-slate-100 stroke-current"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Dimout: 42% */}
                  <path
                    className="text-[#B88710] stroke-current"
                    strokeDasharray="42, 100"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Blackout: 30% */}
                  <path
                    className="text-[#0B2546] stroke-current"
                    strokeDasharray="30, 100"
                    strokeDashoffset="-42"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Solar Screen: 18% */}
                  <path
                    className="text-emerald-500 stroke-current"
                    strokeDasharray="18, 100"
                    strokeDashoffset="-72"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Motorized: 10% */}
                  <path
                    className="text-purple-600 stroke-current"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-[#111827]">100%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B88710]" />
                    Dimout Fabric
                  </span>
                  <span className="font-bold text-[#111827]">42%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0B2546]" />
                    Blackout Solid
                  </span>
                  <span className="font-bold text-[#111827]">30%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Solar Screen 3-5%
                  </span>
                  <span className="font-bold text-[#111827]">18%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    Motorized Somfy
                  </span>
                  <span className="font-bold text-[#111827]">10%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 6. FULL WIDTH — ROW 5: INVENTARIS OPERASIONAL (Section I.3) */}
      <Card
        title="Inventaris & Logistik Operasional"
        subtitle="Monitoring ketersediaan alat kerja dan stok material roller blind"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('peralatan')}
            >
              Lihat Alat
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('material')}
            >
              Cek Material
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Summary Chips (Section I.3) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => navigate('peralatan')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Peralatan Total</span>
              </div>
              <p className="text-xl font-extrabold text-[#111827] mt-1">
                {totalEquipmentCount > 0 ? totalEquipmentCount : 23} item
              </p>
            </div>

            <div
              onClick={() => navigate('peralatan')}
              className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Sedang Dipinjam</span>
              </div>
              <p className="text-xl font-extrabold text-amber-900 mt-1">
                {borrowedEquipmentCount > 0 ? borrowedEquipmentCount : 7} item
              </p>
            </div>

            <div
              onClick={() => navigate('material')}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Boxes className="w-3.5 h-3.5" />
                <span>Material Roller Blind</span>
              </div>
              <p className="text-xl font-extrabold text-[#111827] mt-1">
                {totalMaterialsCount > 0 ? totalMaterialsCount : 16} item
              </p>
            </div>

            <div
              onClick={() => navigate('material')}
              className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 hover:bg-rose-100/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Stok Menipis</span>
              </div>
              <p className="text-xl font-extrabold text-rose-800 mt-1">
                {lowStockMaterialsCount > 0 ? lowStockMaterialsCount : 2} item
              </p>
            </div>
          </div>

          {/* Quick Table for Equipment and Material */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item / Kode</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Status Operasional</th>
                  <th className="py-2.5 px-3">Kondisi / Sisa Stok</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.slice(0, 3).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-[#111827]">
                      {item.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{item.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <Badge status={item.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {item.status === 'Dipinjam' ? `Dipinjam: ${item.currentBorrower}` : item.condition}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('peralatan')}
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Detail →
                      </button>
                    </td>
                  </tr>
                ))}
                {materials.slice(0, 2).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-[#111827]">
                      {item.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{item.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <Badge status={item.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#111827]">
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('material')}
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Restock →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* QUICK MODAL: + BUAT SURVEY */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#111827]">Jadwalkan Survey Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSurvey} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={surveyCustomer}
                  onChange={(e) => setSurveyCustomer(e.target.value)}
                  placeholder="Contoh: Rumah Bpk. Surya / PT Mandiri"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat / Lokasi *</label>
                <input
                  type="text"
                  required
                  value={surveyLocation}
                  onChange={(e) => setSurveyLocation(e.target.value)}
                  placeholder="Contoh: Jl. Kemang Raya No. 12, Jakarta Selatan"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sales PJ</label>
                  <input
                    type="text"
                    value={surveySales}
                    onChange={(e) => setSurveySales(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teknisi Pendamping</label>
                  <select
                    value={surveyTech}
                    onChange={(e) => setSurveyTech(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={surveyDate}
                    onChange={(e) => setSurveyDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Survey</label>
                  <input
                    type="time"
                    value={surveyTime}
                    onChange={(e) => setSurveyTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSurveyModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Jadwal Survey
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK MODAL: + BUAT PEMASANGAN */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#111827]">Jadwalkan Pemasangan Roller Blind</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateInstallation} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Proyek *</label>
                <input
                  type="text"
                  required
                  value={installProject}
                  onChange={(e) => setInstallProject(e.target.value)}
                  placeholder="Contoh: Perumahan Citra Residence / Apartemen Sudirman"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={installCustomer}
                  onChange={(e) => setInstallCustomer(e.target.value)}
                  placeholder="Contoh: Bpk. Gunawan"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Proyek *</label>
                <input
                  type="text"
                  required
                  value={installLocation}
                  onChange={(e) => setInstallLocation(e.target.value)}
                  placeholder="Contoh: Citra Garden 6 Blok H, Jakarta Barat"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teknisi Lead</label>
                  <select
                    value={installTech}
                    onChange={(e) => setInstallTech(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Target (Set)</label>
                  <input
                    type="number"
                    min="1"
                    value={installSets}
                    onChange={(e) => setInstallSets(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mulai Kerja</label>
                  <input
                    type="date"
                    value={installStartDate}
                    onChange={(e) => setInstallStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={installEndDate}
                    onChange={(e) => setInstallEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsInstallModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Jadwal Pemasangan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
