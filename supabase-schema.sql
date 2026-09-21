-- ============================================================
-- ZIPBLIND / ZIPLIND - PT SHINMADO
-- Supabase Relational Database Schema & RLS Policies
-- ============================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Roles Enum / Table
create table if not exists public.roles (
  id text primary key,
  name text not null,
  description text
);

insert into public.roles (id, name, description) values
  ('ADMIN', 'Administrator', 'Akses penuh ke seluruh operasional ZIPLIND'),
  ('TEKNISI', 'Teknisi Lapangan', 'Akses pekerjaan, survey, dan peminjaman alat')
on conflict (id) do nothing;

-- 3. Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role_id text not null references public.roles(id) default 'TEKNISI',
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Technicians Table
create table if not exists public.technicians (
  id text primary key, -- e.g. TKN-001
  name text not null,
  phone text,
  status text not null default 'Aktif' check (status in ('Aktif', 'Nonaktif')),
  joined_date date default current_date,
  avatar_url text,
  created_at timestamptz default now()
);

-- 5. Sales Table
create table if not exists public.sales (
  id text primary key,
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- 6. Customers Table
create table if not exists public.customers (
  id text primary key default concat('CUST-', substring(uuid_generate_v4()::text, 1, 8)),
  name text not null,
  phone text,
  address text not null,
  city text default 'Jakarta',
  notes text,
  created_at timestamptz default now()
);

-- 7. Survey Table
create table if not exists public.surveys (
  id text primary key default concat('SRV-', substring(uuid_generate_v4()::text, 1, 8)),
  customer_id text references public.customers(id) on delete set null,
  customer_name text not null,
  location text not null,
  sales_id text references public.sales(id) on delete set null,
  sales_name text,
  technician_id text references public.technicians(id) on delete set null,
  technician_name text not null,
  assistant_technician_name text,
  survey_date date not null,
  survey_time time not null default '09:00',
  status text not null default 'Terjadwal' check (status in ('Terjadwal', 'Berjalan', 'Selesai', 'Dibatalkan')),
  notes text,
  created_at timestamptz default now()
);

-- 8. Survey Measurements Table
create table if not exists public.survey_measurements (
  id uuid primary key default uuid_generate_v4(),
  survey_id text not null references public.surveys(id) on delete cascade,
  room_name text not null,
  width_cm numeric(7,2) not null,
  height_cm numeric(7,2) not null,
  fabric_type text not null default 'Dimout Grey',
  mechanism text not null default 'Chain Roller',
  notes text,
  created_at timestamptz default now()
);

-- 9. Installations Table (Supports Multi-Day)
create table if not exists public.installations (
  id text primary key default concat('INS-', substring(uuid_generate_v4()::text, 1, 8)),
  project_name text not null,
  customer_id text references public.customers(id) on delete set null,
  customer_name text not null,
  location text not null,
  technician_id text references public.technicians(id) on delete set null,
  technician_name text not null,
  start_date date not null,
  end_date date,
  total_sets integer not null default 1,
  completed_sets integer not null default 0,
  progress_percentage integer not null default 0,
  status text not null default 'Terjadwal' check (status in ('Terjadwal', 'Berjalan', 'Selesai', 'Tertunda')),
  notes text,
  created_at timestamptz default now()
);

-- 10. Installation Items / Multi-day Log
create table if not exists public.installation_items (
  id uuid primary key default uuid_generate_v4(),
  installation_id text not null references public.installations(id) on delete cascade,
  day_number integer not null,
  work_date date not null,
  sets_installed integer not null,
  technician_name text,
  notes text,
  created_at timestamptz default now()
);

-- 11. Work Targets Table (Multi-day & Multiple technicians)
create table if not exists public.work_targets (
  id text primary key default concat('TGT-', substring(uuid_generate_v4()::text, 1, 8)),
  project_name text,
  customer_name text,
  location text,
  technician_id text references public.technicians(id) on delete set null,
  technician_name text not null,
  period_start date not null,
  period_end date not null,
  target_sets integer not null,
  actual_sets integer not null default 0,
  progress_percentage integer not null default 0,
  status text not null default 'Berjalan' check (status in ('Berjalan', 'Selesai', 'Tertunda')),
  notes text,
  created_at timestamptz default now()
);

-- 12. Equipment Table
create table if not exists public.equipment (
  id text primary key, -- e.g. EQ-001
  code text,
  name text not null,
  category text not null,
  status text not null default 'Tersedia' check (status in ('Tersedia', 'Dipinjam', 'Maintenance', 'Rusak')),
  condition text not null default 'Baik' check (condition in ('Baik', 'Rusak Ringan', 'Perlu Servis')),
  serial_number text,
  current_borrower text,
  current_borrower_id text references public.technicians(id) on delete set null,
  last_maintained date,
  notes text,
  created_at timestamptz default now()
);

-- 13. Equipment Loans Table
create table if not exists public.equipment_loans (
  id text primary key default concat('L-', substring(uuid_generate_v4()::text, 1, 8)),
  equipment_id text not null references public.equipment(id) on delete cascade,
  equipment_code text,
  equipment_name text not null,
  borrower_name text not null,
  technician_id text not null references public.technicians(id) on delete cascade,
  borrow_date date not null default current_date,
  estimated_return_date date not null,
  actual_return_date date,
  status text not null default 'Dipinjam' check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  return_condition text check (return_condition in ('Baik', 'Rusak Ringan', 'Perlu Servis')),
  notes text,
  created_at timestamptz default now()
);

-- 14. Materials Table
create table if not exists public.materials (
  id text primary key, -- e.g. MAT-001
  code text,
  name text not null,
  category text not null,
  stock numeric(10,2) not null default 0,
  unit text not null default 'Meter',
  min_stock numeric(10,2) not null default 10,
  status text not null default 'Aman' check (status in ('Aman', 'Menipis', 'Habis')),
  notes text,
  last_restocked date default current_date,
  created_at timestamptz default now()
);

-- 15. Maintenance Table
create table if not exists public.maintenance (
  id text primary key default concat('M-', substring(uuid_generate_v4()::text, 1, 8)),
  equipment_id text not null references public.equipment(id) on delete cascade,
  equipment_code text,
  equipment_name text not null,
  maintenance_type text not null,
  scheduled_date date not null,
  cost numeric(12,2) not null default 0,
  status text not null default 'Terjadwal' check (status in ('Terjadwal', 'Dalam Proses', 'Selesai')),
  technician_in_charge text,
  notes text,
  created_at timestamptz default now()
);

-- 16. Documents Table (Gallery / Attachments via Supabase Storage)
create table if not exists public.documents (
  id text primary key default concat('DOC-', substring(uuid_generate_v4()::text, 1, 8)),
  title text not null,
  type text check (type in ('Survey', 'Pemasangan', 'Maintenance', 'Perbaikan', 'Lainnya')),
  technician_id text references public.technicians(id) on delete set null,
  technician_name text not null,
  location text,
  date date not null default current_date,
  image_url text not null,
  storage_path text,
  description text,
  sets_count integer,
  notes text,
  created_at timestamptz default now()
);

-- 17. Notifications Table
create table if not exists public.notifications (
  id text primary key default concat('NOTIF-', substring(uuid_generate_v4()::text, 1, 8)),
  type text not null check (type in ('warning', 'stock', 'schedule', 'maintenance')),
  title text not null,
  message text not null,
  read boolean not null default false,
  link_page text,
  created_at timestamptz default now()
);

-- 18. Activity Logs Table
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================
alter table public.profiles enable row level security;
alter table public.technicians enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_measurements enable row level security;
alter table public.installations enable row level security;
alter table public.installation_items enable row level security;
alter table public.work_targets enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_loans enable row level security;
alter table public.materials enable row level security;
alter table public.maintenance enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Create basic access policies (Full access for authenticated users / admins)
create policy "Allow all read for authenticated users" on public.profiles for select using (true);
create policy "Allow all read for technicians" on public.technicians for select using (true);
create policy "Allow all write for technicians" on public.technicians for all using (true);
create policy "Allow all access for surveys" on public.surveys for all using (true);
create policy "Allow all access for installations" on public.installations for all using (true);
create policy "Allow all access for equipment" on public.equipment for all using (true);
create policy "Allow all access for materials" on public.materials for all using (true);
create policy "Allow all access for loans" on public.equipment_loans for all using (true);
create policy "Allow all access for notifications" on public.notifications for all using (true);
create policy "Allow all access for documents" on public.documents for all using (true);
create policy "Allow all access for maintenance" on public.maintenance for all using (true);
create policy "Allow all access for work_targets" on public.work_targets for all using (true);
