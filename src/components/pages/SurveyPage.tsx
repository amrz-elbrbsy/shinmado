import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ruler,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  FileText,
  Filter,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { SurveyItem, SurveyMeasurement, ScheduleStatus } from '../../types';

export const SurveyPage: React.FC = () => {
  const { surveys, schedules, technicians, addSurvey, updateSurvey, deleteSurvey, showToast, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSales, setFilterSales] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [selectedSurveyForDetail, setSelectedSurveyForDetail] = useState<SurveyItem | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [sales, setSales] = useState('');
  const [technicianName, setTechnicianName] = useState(technicians[0]?.name || '');
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>(
    technicians[0]?.id ? [technicians[0].id] : []
  );
  const [isTechnicianPickerOpen, setIsTechnicianPickerOpen] = useState(false);
  const [assistantTechnicianName, setAssistantTechnicianName] = useState('');
  const [status, setStatus] = useState<ScheduleStatus>('Terjadwal');
  const [notes, setNotes] = useState('');

  // Dynamic measurement rows
  const [measurements, setMeasurements] = useState<SurveyMeasurement[]>([
    {
      id: 'm-init-1',
      roomName: 'Ruang Tamu Jendela 1',
      widthCm: 180,
      heightCm: 220,
      fabricType: 'Dimout Grey',
      mechanism: 'Chain 38mm Heavy Duty',
      notes: 'Kusen aluminium standar',
    },
  ]);

  const openAddModal = () => {
    setEditingSurveyId(null);
    setCustomerName('');
    setLocation('');
    setSales('');
    setTechnicianName(technicians[0]?.name || '');
    setSelectedTechnicianIds(technicians[0]?.id ? [technicians[0].id] : []);
    setIsTechnicianPickerOpen(false);
    setAssistantTechnicianName('');
    setStatus('Terjadwal');
    setNotes('');
    setMeasurements([
      {
        id: 'm-new-1',
        roomName: 'Ruang Tamu',
        widthCm: 180,
        heightCm: 220,
        fabricType: 'Dimout Grey',
        mechanism: 'Chain 38mm',
        notes: '',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (survey: SurveyItem) => {
    setEditingSurveyId(survey.id);
    setCustomerName(survey.customerName);
    setLocation(survey.location);
    setSales(survey.sales);
    const existingTechnicianIds = Array.from(new Set([
      ...(survey.technicianIds || [survey.technicianId]),
      ...(survey.technicianNames || [])
        .map((name) => technicians.find((technician) => technician.name === name)?.id)
        .filter((id): id is string => Boolean(id)),
    ]));
    setSelectedTechnicianIds(existingTechnicianIds);
    setIsTechnicianPickerOpen(false);
    setTechnicianName(survey.technicianName);
    setAssistantTechnicianName(survey.assistantTechnicianName || '');
    setStatus(survey.status);
    setNotes(survey.notes || '');
    setMeasurements(
      survey.measurements && survey.measurements.length > 0
        ? [...survey.measurements]
        : [
            {
              id: 'm-edit-1',
              roomName: 'Kamar Utama',
              widthCm: 150,
              heightCm: 200,
              fabricType: 'Blackout White',
              mechanism: 'Chain 38mm',
            },
          ]
    );
    setIsModalOpen(true);
  };

  const addMeasurementRow = () => {
    const newId = `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setMeasurements((prev) => [
      ...prev,
      {
        id: newId,
        roomName: `Ruangan ${prev.length + 1}`,
        widthCm: 160,
        heightCm: 210,
        fabricType: 'Dimout Grey',
        mechanism: 'Chain 38mm',
        notes: '',
      },
    ]);
  };

  const removeMeasurementRow = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeasurementField = (id: string, field: keyof SurveyMeasurement, val: any) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const selectedTechnicians = technicians.filter((technician) => selectedTechnicianIds.includes(technician.id));
  const toggleTechnician = (technicianId: string) => {
    setSelectedTechnicianIds((currentIds) =>
      currentIds.includes(technicianId)
        ? currentIds.filter((id) => id !== technicianId)
        : [...currentIds, technicianId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !location) {
      showToast('Harap lengkapi nama pelanggan dan alamat', undefined, 'error');
      return;
    }

    if (selectedTechnicians.length === 0) {
      showToast('Pilih minimal satu teknisi', undefined, 'error');
      return;
    }
    const technicianNames = selectedTechnicians.map((technician) => technician.name);

    const saved = editingSurveyId
      ? await updateSurvey(editingSurveyId, {
        customerName,
        location,
        sales,
        technicianId: selectedTechnicians[0].id,
        technicianName: technicianNames[0],
        technicianIds: selectedTechnicians.map((technician) => technician.id),
        technicianNames,
        assistantTechnicianName: technicianNames.slice(1).join(', '),
        status,
        notes,
        measurements,
        })
      : await addSurvey({
        customerName,
        location,
        sales,
        technicianId: selectedTechnicians[0].id,
        technicianName: technicianNames[0],
        technicianIds: selectedTechnicians.map((technician) => technician.id),
        technicianNames,
        assistantTechnicianName: technicianNames.slice(1).join(', '),
        date: '',
        time: '',
        status,
        notes,
        measurements,
        hasDocumentation: true,
        });

    if (saved) setIsModalOpen(false);
  };

  const filteredSurveys = surveys.filter((s) => {
    const customerName = s.customerName || '';
    const location = s.location || '';
    const technicianName = s.technicianName || '';
    const sales = s.sales || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sales.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSales = filterSales === 'all' || sales === filterSales;
    const surveyDate = s.date || '';
    const matchesStartDate = !filterStartDate || surveyDate >= filterStartDate;
    const matchesEndDate = !filterEndDate || surveyDate <= filterEndDate;

    return matchesSearch && matchesStatus && matchesSales && matchesStartDate && matchesEndDate;
  });
  const salesOptions = Array.from(new Set(surveys.map((survey) => survey.sales).filter(Boolean)));
  const getSurveySchedule = (survey: SurveyItem) => schedules.find((schedule) => schedule.surveyId === survey.id);
  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterSales('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const totalSurveys = surveys.length;
  const scheduledCount = surveys.filter((s) => s.status === 'Terjadwal').length;
  const inProgressCount = surveys.filter((s) => s.status === 'Berjalan').length;
  const completedCount = surveys.filter((s) => s.status === 'Selesai').length;
  const totalMeasurementPoints = surveys.reduce((acc, s) => acc + (s.measurements?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Manajemen Lapangan
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Survey & Pengukuran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Kelola jadwal survey lapangan, teknisi pendamping, dan input hasil pengukuran kusen roller blind.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4 text-white" />}
          onClick={openAddModal}
          className="shadow-xs font-bold text-xs"
        >
          + Jadwalkan Survey
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Agenda Survey</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalSurveys}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua data terdata di sistem</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Menunggu Survey</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2DF] text-[#B88710] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{scheduledCount}</p>
          <p className="text-[11px] text-[#8C6207] font-semibold mt-0.5">Jadwal aktif mendatang</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sedang Berjalan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Teknisi di lokasi</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Selesai Diukur</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{completedCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{totalMeasurementPoints} total titik kusen</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan, alamat, sales, atau teknisi..."
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] cursor-pointer"
            >
              <option value="all">Semua Sales</option>
              {salesOptions.map((salesName) => (
                <option key={salesName} value={salesName}>{salesName}</option>
              ))}
            </select>

            <label className="text-xs font-bold text-slate-500">Tanggal Mulai</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
            <label className="text-xs font-bold text-slate-500">Tanggal Akhir</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
            />
            <Button type="button" variant="secondary" size="sm" onClick={resetFilters}>
              Reset Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Survey Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID & Pelanggan</th>
                <th className="py-3.5 px-4">Lokasi / Alamat</th>
                <th className="py-3.5 px-4">Sales & Tim Teknisi</th>
                <th className="py-3.5 px-4">Jadwal Survey</th>
                <th className="py-3.5 px-4">Hasil Ukuran</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada jadwal survey yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{survey.customerName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{survey.id}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-700 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{survey.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-bold">{survey.sales}</div>
                      <div className="text-[11px] text-[#8C6207] font-semibold mt-0.5">
                        {(survey.technicianNames?.length
                          ? survey.technicianNames
                          : [survey.technicianName, ...(survey.assistantTechnicianName ? [survey.assistantTechnicianName] : [])]
                        ).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const schedule = getSurveySchedule(survey);
                        return schedule ? (
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {schedule.date}
                            <span className="text-[11px] text-slate-500 font-mono">{schedule.time} WIB</span>
                          </div>
                        ) : <span className="text-slate-400 italic">Belum dijadwalkan</span>;
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      {survey.measurements && survey.measurements.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSurveyForDetail(survey)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF2DF] text-[#8C6207] hover:bg-[#F2E0B5] border border-[#F2E0B5] font-bold cursor-pointer transition-colors"
                        >
                          <Ruler className="w-3 h-3 text-[#B88710]" />
                          <span>{survey.measurements.length} Titik Ukur</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Belum diukur</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={survey.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(survey)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-[#FAF2DF] hover:text-[#8C6207] transition-colors cursor-pointer"
                          title="Edit Survey"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSurvey(survey.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Detail Modal: Hasil Pengukuran */}
      {selectedSurveyForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8C6207] uppercase tracking-wider">
                  HASIL PENGUKURAN KUSEN
                </span>
                <h3 className="text-base font-bold text-[#111827]">
                  {selectedSurveyForDetail.customerName} ({selectedSurveyForDetail.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSurveyForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex flex-wrap gap-4">
              <div>
                <span className="text-slate-400 block">Sales:</span>
                <span className="font-bold">{selectedSurveyForDetail.sales}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Teknisi Pengukur:</span>
                <span className="font-bold">
                  {(selectedSurveyForDetail.technicianNames?.length
                    ? selectedSurveyForDetail.technicianNames
                    : [selectedSurveyForDetail.technicianName]
                  ).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Jadwal:</span>
                {(() => {
                  const schedule = getSurveySchedule(selectedSurveyForDetail);
                  return schedule ? <span className="font-bold">{schedule.date} ({schedule.time})</span> : <span className="text-slate-500">Belum dijadwalkan</span>;
                })()}
              </div>
              <button type="button" onClick={() => navigate('jadwal')} className="text-[#8C6207] font-bold">Kelola di Kalender</button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F6F8] font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Ruangan / Posisi</th>
                    <th className="p-2.5">Dimensi (L × T)</th>
                    <th className="p-2.5">Kain / Fabric</th>
                    <th className="p-2.5">Mekanisme</th>
                    <th className="p-2.5">Catatan Teknis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSurveyForDetail.measurements?.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-[#111827]">{m.roomName}</td>
                      <td className="p-2.5 font-mono font-bold text-[#8C6207]">
                        {m.widthCm} × {m.heightCm} cm
                      </td>
                      <td className="p-2.5 text-slate-700">{m.fabricType}</td>
                      <td className="p-2.5 text-slate-600">{m.mechanism}</td>
                      <td className="p-2.5 text-slate-500 italic">{m.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedSurveyForDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal: Tambah / Edit Survey */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#B88710]" />
                <h3 className="text-base font-bold text-[#111827]">
                  {editingSurveyId ? 'Edit Data Survey' : 'Tambah Survey'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="block text-slate-400">Jadwal Survey</span>
                {(() => {
                  const survey = surveys.find((item) => item.id === editingSurveyId);
                  const schedule = survey ? getSurveySchedule(survey) : undefined;
                  return schedule ? (
                    <>
                      <p className="font-semibold text-slate-700">{schedule.date} - {schedule.time}</p>
                      <p className="text-slate-500">Status: {schedule.status}</p>
                    </>
                  ) : <p className="font-semibold text-slate-700">Belum dijadwalkan</p>;
                })()}
                <button type="button" onClick={() => navigate('jadwal')} className="mt-1 text-[#8C6207] font-bold hover:underline">
                  Dikelola melalui Kalender Jadwal
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Rumah Bpk. Hendra"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat / Lokasi *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Pondok Indah, Jakarta Selatan"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sales PJ</label>
                  <input
                    type="text"
                    value={sales}
                    onChange={(e) => setSales(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teknisi yang Mendampingi *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTechnicianPickerOpen((isOpen) => !isOpen)}
                      className="w-full min-h-10 text-left text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none cursor-pointer"
                    >
                      {selectedTechnicians.length === 0 ? (
                        <span className="text-slate-400">Pilih satu atau beberapa teknisi</span>
                      ) : (
                        <span className="flex flex-wrap gap-1.5">
                          {selectedTechnicians.map((technician) => (
                            <span
                              key={technician.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#FAF2DF] border border-[#F2E0B5] px-2 py-1 text-[#8C6207] font-semibold"
                            >
                              {technician.name}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Hapus ${technician.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleTechnician(technician.id);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    toggleTechnician(technician.id);
                                  }
                                }}
                                className="cursor-pointer text-[#B88710] hover:text-[#8C6207]"
                              >
                                <X className="w-3 h-3" />
                              </span>
                            </span>
                          ))}
                        </span>
                      )}
                    </button>

                    {isTechnicianPickerOpen && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                        {technicians.length === 0 ? (
                          <p className="px-2 py-2 text-xs text-slate-400">Belum ada teknisi.</p>
                        ) : technicians.map((technician) => {
                          const isSelected = selectedTechnicianIds.includes(technician.id);
                          return (
                            <button
                              key={technician.id}
                              type="button"
                              onClick={() => toggleTechnician(technician.id)}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                                isSelected ? 'bg-[#FAF2DF] text-[#8C6207] font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{technician.name} ({technician.id})</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B88710]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Pilih satu atau beberapa teknisi. Klik x pada chip untuk menghapus.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none cursor-pointer"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Measurement Rows */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827]">
                    <Ruler className="w-4 h-4 text-[#B88710]" />
                    <span>Hasil Pengukuran Kusen & Ruangan</span>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addMeasurementRow}>
                    + Tambah Ruangan
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {measurements.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Nama Ruangan"
                        value={m.roomName}
                        onChange={(e) => updateMeasurementField(m.id, 'roomName', e.target.value)}
                        className="w-full sm:w-1/4 text-xs rounded border border-slate-200 p-1.5"
                      />
                      <div className="flex items-center gap-1 w-full sm:w-1/4">
                        <input
                          type="number"
                          placeholder="L (cm)"
                          value={m.widthCm}
                          onChange={(e) => updateMeasurementField(m.id, 'widthCm', parseFloat(e.target.value) || 0)}
                          className="w-1/2 text-xs rounded border border-slate-200 p-1.5"
                        />
                        <span className="text-slate-400">×</span>
                        <input
                          type="number"
                          placeholder="T (cm)"
                          value={m.heightCm}
                          onChange={(e) => updateMeasurementField(m.id, 'heightCm', parseFloat(e.target.value) || 0)}
                          className="w-1/2 text-xs rounded border border-slate-200 p-1.5"
                        />
                      </div>
                      <select
                        value={m.fabricType}
                        onChange={(e) => updateMeasurementField(m.id, 'fabricType', e.target.value)}
                        className="w-full sm:w-1/4 text-xs rounded border border-slate-200 p-1.5"
                      >
                        <option value="Dimout Grey">Dimout Grey</option>
                        <option value="Blackout White">Blackout White</option>
                        <option value="Solar Screen 3%">Solar Screen 3%</option>
                        <option value="Solar Screen 5%">Solar Screen 5%</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMeasurementRow(m.id)}
                        className="p-1 text-slate-400 hover:text-red-600 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Teknis</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan kusen miring, plafon gypsum, atau kebutuhan bracket siku..."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Survey
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
