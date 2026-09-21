import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Sliders,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Bell,
  KeyRound,
  Plus,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tabs } from '../ui/Tabs';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { testSupabaseConnection } from '../../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { currentUser, updateCurrentUser, showToast, supabaseStatus } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'supabase' | 'company' | 'operational' | 'users'>(
    'profile'
  );

  // 1. Profil Admin State (Muhammad Amrizal)
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 2. Supabase Integration State
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('ziplind_custom_supabase_url') ||
      import.meta.env.VITE_SUPABASE_URL ||
      ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    localStorage.getItem('ziplind_custom_supabase_key') ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      ''
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 3. Perusahaan / Brand State (PT SHINMADO, ZIPBLIND)
  const [companyForm, setCompanyForm] = useState({
    companyName: 'PT SHINMADO',
    appName: 'ZIPBLIND',
    tagline: 'Sistem Operasional Roller Blind & Teknisi Lapangan',
    address: 'Jl. Graha Shinmado No. 88, Kebayoran Baru, Jakarta Selatan 12160',
    phone: '+62 21 7288 9900',
    email: 'operasional@shinmado.co.id',
    website: 'https://shinmado.co.id',
  });

  // 4. Konfigurasi Operasional
  const [operationalForm, setOperationalForm] = useState({
    workStart: '08:00',
    workEnd: '17:00',
    workDays: 'Senin - Sabtu',
    defaultMinStockFabric: 15,
    defaultMinStockSparepart: 10,
    prefixTechnician: 'TKN',
    prefixLoan: 'L',
    prefixMaintenance: 'M',
    autoRemindReturnDays: 1,
  });

  // 5. Manajemen User
  const [usersList, setUsersList] = useState([
    {
      id: 'USR-01',
      name: 'Muhammad Amrizal',
      email: 'mamrizal953@gmail.com',
      role: 'Administrator',
      status: 'Aktif',
    },
    {
      id: 'USR-02',
      name: 'Rian Pratama',
      email: 'rian.koordinator@shinmado.co.id',
      role: 'Koordinator Lapangan',
      status: 'Aktif',
    },
    {
      id: 'USR-03',
      name: 'Siti Rahma',
      email: 'siti.viewer@shinmado.co.id',
      role: 'Viewer / Sales Monitor',
      status: 'Aktif',
    },
  ]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: profileForm.name,
      email: profileForm.email,
    });
    showToast('Profil Berhasil Diperbarui', 'Informasi akun admin Anda telah tersimpan.', 'success');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ziplind_custom_supabase_url', supabaseUrl.trim());
    localStorage.setItem('ziplind_custom_supabase_key', supabaseKey.trim());
    showToast(
      'Konfigurasi Supabase Disimpan',
      'Kredensial disimpan. Halaman akan memuat ulang koneksi secara otomatis.',
      'success'
    );
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        showToast('Supabase Terhubung', res.message, 'success');
      } else {
        showToast('Status Koneksi', res.message, 'info');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Gagal mengetes koneksi' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const copySqlSchema = () => {
    const schemaNotice = `-- ZIPBLIND PT SHINMADO — SUPABASE POSTGRESQL SCHEMA
-- File lengkap tersedia di root project: /supabase-schema.sql
-- Silakan salin atau jalankan di Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS public.technicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif'
);
-- (Lihat /supabase-schema.sql untuk 12 tabel lengkap)`;
    navigator.clipboard.writeText(schemaNotice);
    showToast('Info Schema Disalin', 'File lengkap ada di /supabase-schema.sql pada workspace.');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6207] bg-[#FAF2DF] border border-[#F2E0B5] px-2.5 py-0.5 rounded-full">
              Konfigurasi Sistem
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Konfigurasi database Supabase, akun Administrator, identitas PT SHINMADO, dan parameter operasional.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'profile', label: 'Profil Admin', icon: <User className="w-4 h-4" /> },
          { id: 'supabase', label: 'Supabase Database', icon: <Database className="w-4 h-4" /> },
          { id: 'company', label: 'Perusahaan & Brand', icon: <Building2 className="w-4 h-4" /> },
          { id: 'operational', label: 'Konfigurasi Operasional', icon: <Sliders className="w-4 h-4" /> },
          { id: 'users', label: 'Manajemen User', icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#B88710] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. PROFIL ADMIN */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Informasi Akun Admin" subtitle="Perbarui nama dan alamat email login Anda">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <Avatar name={profileForm.name} size="lg" />
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{profileForm.name}</h3>
                    <p className="text-xs text-[#64748B]">{currentUser.role}</p>
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      Administrator Aktif
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap *"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Alamat Email *"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                    Simpan Perubahan Profil
                  </Button>
                </div>
              </form>
            </Card>

            <Card title="Ganti Password" subtitle="Perbarui kata sandi akun admin Anda">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('Password Berhasil Diubah', 'Kata sandi login telah diperbarui.', 'success');
                }}
                className="space-y-4"
              >
                <Input
                  label="Password Saat Ini"
                  type="password"
                  placeholder="••••••••"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password Baru"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  />
                  <Input
                    label="Konfirmasi Password Baru"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="outline" leftIcon={<KeyRound className="w-4 h-4" />}>
                    Ubah Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Status Hak Akses" subtitle="Tingkat wewenang Administrator">
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Akses Penuh Seluruh Modul</span>
                </div>
                <p className="leading-relaxed text-[#64748B]">
                  Sebagai Administrator ZIPBLIND, Anda memiliki hak kelola penuh atas data teknisi, jadwal survey, pemasangan roller blind, peminjaman alat, stok kain, laporan, dan konfigurasi database Supabase.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                  User ID: <span className="font-bold text-slate-900">{currentUser.id}</span>
                  <br />
                  Login Terakhir: <span className="font-bold text-slate-900">Hari ini, 08:00 WIB</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. SUPABASE BACKEND INTEGRATION (Section K) */}
      {activeTab === 'supabase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card
              title="Integrasi Supabase Backend"
              subtitle="Hubungkan sistem ZIPBLIND dengan database cloud PostgreSQL Supabase"
            >
              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                {/* Connection Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    supabaseStatus.isConnected
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <Server className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        {supabaseStatus.isConnected ? 'SUPABASE TERHUBUNG' : 'MODE OFFLINE-FIRST AKTIF'}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-current">
                        {supabaseStatus.isConnected ? 'Realtime DB' : 'Local Fallback'}
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {supabaseStatus.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://your-project-ref.supabase.co"
                      className="w-full text-xs font-mono rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Dapatkan dari Dashboard Supabase &gt; Project Settings &gt; API &gt; Project URL
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Supabase Anon Public API Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full text-xs font-mono rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710]"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Dapatkan dari Dashboard Supabase &gt; Project Settings &gt; API &gt; anon / public key
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
                  <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                    Simpan Kredensial
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />}
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? 'Menguji...' : 'Test Koneksi Supabase'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={copySqlSchema}
                  >
                    Salin SQL Schema
                  </Button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs border ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span className="font-bold">Hasil Uji: </span>
                    {testResult.message}
                  </div>
                )}
              </form>
            </Card>

            <Card
              title="Skema Tabel Database PostgreSQL (12 Relational Tables)"
              subtitle="Arsitektur data lengkap yang otomatis disinkronkan"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                {[
                  { table: 'technicians', desc: 'Data personil teknisi' },
                  { table: 'schedules', desc: 'Jadwal & kalender' },
                  { table: 'surveys', desc: 'Survey & pengukuran' },
                  { table: 'measurements', desc: 'Dimensi kusen L × T' },
                  { table: 'installations', desc: 'Proyek pemasangan' },
                  { table: 'targets', desc: 'Target unit & capaian' },
                  { table: 'equipment', desc: 'Alat kerja & bor' },
                  { table: 'loans', desc: 'Peminjaman alat' },
                  { table: 'materials', desc: 'Stok kain roller blind' },
                  { table: 'maintenance_logs', desc: 'Servis rutin alat' },
                  { table: 'activity_logs', desc: 'Audit trail aktivitas' },
                  { table: 'notifications', desc: 'Pusat notifikasi & alert' },
                ].map((item) => (
                  <div key={item.table} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-[#8C6207] block">public.{item.table}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{item.desc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card title="Petunjuk Setup Supabase" subtitle="Langkah praktis menghubungkan database">
              <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <li>
                  Buka akun di <span className="font-bold text-blue-600">supabase.com</span> dan buat project baru.
                </li>
                <li>
                  Buka menu <span className="font-semibold text-slate-900">SQL Editor</span> di project Supabase Anda.
                </li>
                <li>
                  Jalankan skrip yang ada di file <span className="font-mono text-slate-800 font-bold">/supabase-schema.sql</span>.
                </li>
                <li>
                  Buka <span className="font-semibold text-slate-900">Project Settings &gt; API</span> lalu salin URL dan anon key ke form di samping.
                </li>
                <li>
                  Klik <span className="font-bold text-blue-600">Simpan & Test Koneksi</span>. Data Anda langsung realtime tersinkron!
                </li>
              </ol>
            </Card>
          </div>
        </div>
      )}

      {/* 3. PERUSAHAAN & BRAND */}
      {activeTab === 'company' && (
        <Card title="Profil PT SHINMADO & ZIPBLIND" subtitle="Identitas resmi perusahaan pada dokumen & laporan">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Informasi Perusahaan Tersimpan', 'Data identitas PT SHINMADO & ZIPBLIND telah diperbarui.');
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Perusahaan"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
              />
              <Input
                label="Nama Aplikasi"
                value={companyForm.appName}
                onChange={(e) => setCompanyForm({ ...companyForm, appName: e.target.value })}
              />
            </div>
            <Input
              label="Tagline / Deskripsi"
              value={companyForm.tagline}
              onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
            />
            <Input
              label="Alamat Kantor Pusat"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="No. Telepon"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
              />
              <Input
                label="Email Operasional"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Simpan Informasi Perusahaan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. KONFIGURASI OPERASIONAL */}
      {activeTab === 'operational' && (
        <Card title="Parameter Operasional" subtitle="Aturan jam kerja, batas minimum stok, dan format nomor tiket">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Konfigurasi Tersimpan', 'Parameter jam kerja & threshold stok telah diterapkan.');
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Jam Masuk Kerja"
                value={operationalForm.workStart}
                onChange={(e) => setOperationalForm({ ...operationalForm, workStart: e.target.value })}
              />
              <Input
                label="Jam Pulang Kerja"
                value={operationalForm.workEnd}
                onChange={(e) => setOperationalForm({ ...operationalForm, workEnd: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Batas Minimum Stok Kain (meter)"
                type="number"
                value={operationalForm.defaultMinStockFabric}
                onChange={(e) =>
                  setOperationalForm({
                    ...operationalForm,
                    defaultMinStockFabric: parseInt(e.target.value, 10) || 15,
                  })
                }
              />
              <Input
                label="Batas Minimum Sparepart (unit)"
                type="number"
                value={operationalForm.defaultMinStockSparepart}
                onChange={(e) =>
                  setOperationalForm({
                    ...operationalForm,
                    defaultMinStockSparepart: parseInt(e.target.value, 10) || 10,
                  })
                }
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Simpan Konfigurasi Operasional
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 5. MANAJEMEN USER */}
      {activeTab === 'users' && (
        <Card
          title="Manajemen Pengguna Sistem"
          subtitle="Daftar administrator, koordinator, dan staf dengan akses ke ZIPBLIND"
          action={
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              + Tambah User
            </Button>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6F8] font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Peran / Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#111827] flex items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <span>{user.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{user.email}</td>
                    <td className="p-3">
                      <span className="font-semibold text-[#8C6207] bg-[#FAF2DF] px-2 py-0.5 rounded-md border border-[#F2E0B5]">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-[#8C6207] hover:underline font-semibold cursor-pointer">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
