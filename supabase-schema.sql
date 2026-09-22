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

-- 6a. Operational schedules used by the calendar and dashboard.
create table if not exists public.schedules (
  id text primary key default concat('SCH-', substring(uuid_generate_v4()::text, 1, 8)),
  survey_id text,
  installation_id text,
  date date not null,
  time time not null default '09:00',
  type text not null check (type in ('Survey', 'Pemasangan', 'Perbaikan', 'Lainnya')),
  sales text,
  technician_id text references public.technicians(id) on delete set null,
  technician_name text not null,
  assistant_technician_name text,
  customer_name text not null,
  sets_count integer,
  location text not null,
  status text not null default 'Terjadwal' check (status in ('Terjadwal', 'Berjalan', 'Selesai', 'Dibatalkan')),
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

-- 8a. Survey <-> Technicians (many-to-many)
create table if not exists public.survey_technicians (
  survey_id text not null references public.surveys(id) on delete cascade,
  technician_id text not null references public.technicians(id) on delete restrict,
  assigned_at timestamptz default now(),
  primary key (survey_id, technician_id)
);

-- Preserve the existing single-technician assignment while migrating to the relation table.
insert into public.survey_technicians (survey_id, technician_id)
select s.id, s.technician_id
from public.surveys s
where s.technician_id is not null
on conflict (survey_id, technician_id) do nothing;

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
  status text not null default 'Terjadwal' check (status in ('Terjadwal', 'Berjalan', 'Dalam Proses', 'Selesai', 'Tertunda')),
  notes text,
  created_at timestamptz default now()
);

-- Existing installations may have been created with the earlier status check.
alter table public.installations drop constraint if exists installations_status_check;
alter table public.installations
  add constraint installations_status_check
  check (status in ('Terjadwal', 'Berjalan', 'Dalam Proses', 'Selesai', 'Tertunda'));

-- Add schedule links when schedules already exists from an older schema.
alter table public.schedules add column if not exists survey_id text;
alter table public.schedules add column if not exists installation_id text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'schedules_survey_id_fkey') then
    alter table public.schedules add constraint schedules_survey_id_fkey
      foreign key (survey_id) references public.surveys(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'schedules_installation_id_fkey') then
    alter table public.schedules add constraint schedules_installation_id_fkey
      foreign key (installation_id) references public.installations(id) on delete set null;
  end if;
end $$;
create unique index if not exists schedules_one_per_survey_idx
  on public.schedules (survey_id) where survey_id is not null;
create unique index if not exists schedules_one_per_installation_idx
  on public.schedules (installation_id) where installation_id is not null;

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

-- 12a. Physical equipment units (one equipment type has many units)
create table if not exists public.equipment_units (
  id text primary key default concat('UNIT-', substring(uuid_generate_v4()::text, 1, 8)),
  equipment_id text not null references public.equipment(id) on delete cascade,
  unit_code text not null unique,
  status text not null default 'Tersedia' check (status in ('Tersedia', 'Dipinjam', 'Maintenance', 'Rusak')),
  condition text not null default 'Baik' check (condition in ('Baik', 'Rusak Ringan', 'Perlu Servis')),
  serial_number text,
  current_borrower text,
  current_borrower_id text references public.technicians(id) on delete set null,
  last_borrow_date timestamptz,
  last_return_date timestamptz,
  created_at timestamptz default now()
);

-- Existing equipment rows represent one physical unit until additional units are created.
insert into public.equipment_units (equipment_id, unit_code, status, condition, serial_number, current_borrower, current_borrower_id)
select e.id,
       concat(e.id, '-001'),
       e.status,
       e.condition,
       e.serial_number,
       e.current_borrower,
       e.current_borrower_id
from public.equipment e
where not exists (
  select 1 from public.equipment_units u where u.equipment_id = e.id
);

-- 13. Equipment Loans Table
create table if not exists public.equipment_loans (
  id text primary key default concat('L-', substring(uuid_generate_v4()::text, 1, 8)),
  equipment_id text not null references public.equipment(id) on delete cascade,
  unit_id text references public.equipment_units(id) on delete restrict,
  unit_code text,
  equipment_code text,
  equipment_name text not null,
  borrower_name text not null,
  technician_id text not null references public.technicians(id) on delete cascade,
  borrow_date date not null default current_date,
  borrowed_at timestamptz not null default now(),
  estimated_return_date date not null,
  actual_return_date date,
  returned_at timestamptz,
  status text not null default 'Dipinjam' check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  return_condition text check (return_condition in ('Baik', 'Rusak Ringan', 'Perlu Servis')),
  notes text,
  created_at timestamptz default now()
);

-- Add the new unit fields when this migration runs against an existing table.
alter table public.equipment_loans
  add column if not exists unit_id text references public.equipment_units(id) on delete restrict;
alter table public.equipment_loans
  add column if not exists unit_code text;
alter table public.equipment_loans
  add column if not exists borrowed_at timestamptz default now();
alter table public.equipment_loans
  add column if not exists returned_at timestamptz;

-- Preserve existing dates while making timestamp reporting available.
update public.equipment_loans
set borrowed_at = borrow_date::timestamptz
where borrowed_at is null;
alter table public.equipment_loans alter column borrowed_at set not null;
update public.equipment_loans
set returned_at = actual_return_date::timestamptz
where returned_at is null and actual_return_date is not null;

-- Link existing loan history to the unit created above.
update public.equipment_loans l
set unit_id = u.id,
    unit_code = u.unit_code
from public.equipment_units u
where l.unit_id is null
  and u.equipment_id = l.equipment_id;

create unique index if not exists equipment_loans_one_active_per_unit
  on public.equipment_loans (unit_id)
  where unit_id is not null and status in ('Dipinjam', 'Terlambat');

create or replace function public.validate_equipment_loan_unit()
returns trigger
language plpgsql
as $$
declare
  unit_status text;
begin
  if new.status in ('Dipinjam', 'Terlambat') then
    if new.unit_id is null then
      raise exception 'Peminjaman aktif wajib memilih unit peralatan.';
    end if;

    select status into unit_status
    from public.equipment_units
    where id = new.unit_id
    for update;

    if unit_status is null then
      raise exception 'Unit peralatan tidak ditemukan.';
    end if;

    if unit_status <> 'Tersedia'
       and not exists (
         select 1
         from public.equipment_loans existing
         where existing.id = new.id
           and existing.unit_id = new.unit_id
           and existing.status in ('Dipinjam', 'Terlambat')
       ) then
      raise exception 'Unit peralatan tidak tersedia untuk dipinjam.';
    end if;

    if exists (
      select 1
      from public.equipment_loans existing
      where existing.unit_id = new.unit_id
        and existing.status in ('Dipinjam', 'Terlambat')
        and existing.id <> new.id
    ) then
      raise exception 'Unit peralatan masih memiliki peminjaman aktif.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists equipment_loan_unit_validate on public.equipment_loans;
create trigger equipment_loan_unit_validate
before insert or update of status, unit_id
on public.equipment_loans
for each row execute function public.validate_equipment_loan_unit();

create or replace function public.sync_equipment_unit_from_loan()
returns trigger
language plpgsql
as $$
begin
  if new.unit_id is null then
    return new;
  end if;

  if new.status in ('Dipinjam', 'Terlambat') then
    update public.equipment_units
    set status = 'Dipinjam',
        current_borrower = new.borrower_name,
        current_borrower_id = new.technician_id,
        last_borrow_date = coalesce(new.borrowed_at, new.borrow_date::timestamptz)
    where id = new.unit_id;
  elsif new.status = 'Dikembalikan' then
    update public.equipment_units
    set status = case when new.return_condition = 'Perlu Servis' then 'Maintenance' else 'Tersedia' end,
        condition = coalesce(new.return_condition, condition),
        current_borrower = null,
        current_borrower_id = null,
        last_return_date = coalesce(new.returned_at, new.actual_return_date::timestamptz, now())
    where id = new.unit_id;
  end if;
  return new;
end;
$$;

drop trigger if exists equipment_loan_unit_sync on public.equipment_loans;
create trigger equipment_loan_unit_sync
after insert or update of status, unit_id, borrower_name, technician_id, borrow_date, borrowed_at, actual_return_date, returned_at, return_condition
on public.equipment_loans
for each row execute function public.sync_equipment_unit_from_loan();

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
alter table public.roles enable row level security;
alter table public.technicians enable row level security;
alter table public.sales enable row level security;
alter table public.customers enable row level security;
alter table public.schedules enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_measurements enable row level security;
alter table public.survey_technicians enable row level security;
alter table public.installations enable row level security;
alter table public.installation_items enable row level security;
alter table public.work_targets enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_units enable row level security;
alter table public.equipment_loans enable row level security;
alter table public.materials enable row level security;
alter table public.maintenance enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Create basic access policies (Full access for authenticated users / admins)
drop policy if exists "Allow all read for authenticated users" on public.profiles;
create policy "Allow all read for authenticated users" on public.profiles for select using (true);
drop policy if exists "Allow profile write for authenticated users" on public.profiles;
create policy "Allow profile write for authenticated users" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Allow all read for roles" on public.roles;
create policy "Allow all read for roles" on public.roles for select using (true);
drop policy if exists "Allow all read for technicians" on public.technicians;
create policy "Allow all read for technicians" on public.technicians for select using (true);
drop policy if exists "Allow all write for technicians" on public.technicians;
create policy "Allow all write for technicians" on public.technicians for all using (true) with check (true);
drop policy if exists "Allow all access for sales" on public.sales;
create policy "Allow all access for sales" on public.sales for all using (true) with check (true);
drop policy if exists "Allow all access for customers" on public.customers;
create policy "Allow all access for customers" on public.customers for all using (true) with check (true);
drop policy if exists "Allow all access for schedules" on public.schedules;
create policy "Allow all access for schedules" on public.schedules for all using (true) with check (true);
drop policy if exists "Allow all access for surveys" on public.surveys;
create policy "Allow all access for surveys" on public.surveys for all using (true) with check (true);
drop policy if exists "Allow all access for survey_measurements" on public.survey_measurements;
create policy "Allow all access for survey_measurements" on public.survey_measurements for all using (true) with check (true);
drop policy if exists "Allow all access for survey_technicians" on public.survey_technicians;
create policy "Allow all access for survey_technicians" on public.survey_technicians for all using (true) with check (true);
drop policy if exists "Allow all access for installations" on public.installations;
create policy "Allow all access for installations" on public.installations for all using (true) with check (true);
drop policy if exists "Allow all access for installation_items" on public.installation_items;
create policy "Allow all access for installation_items" on public.installation_items for all using (true) with check (true);
drop policy if exists "Allow all access for equipment" on public.equipment;
create policy "Allow all access for equipment" on public.equipment for all using (true) with check (true);
drop policy if exists "Allow all access for equipment_units" on public.equipment_units;
create policy "Allow all access for equipment_units" on public.equipment_units for all using (true) with check (true);
drop policy if exists "Allow all access for materials" on public.materials;
create policy "Allow all access for materials" on public.materials for all using (true) with check (true);
drop policy if exists "Allow all access for loans" on public.equipment_loans;
create policy "Allow all access for loans" on public.equipment_loans for all using (true) with check (true);
drop policy if exists "Allow all access for notifications" on public.notifications;
create policy "Allow all access for notifications" on public.notifications for all using (true) with check (true);
drop policy if exists "Allow all access for documents" on public.documents;
create policy "Allow all access for documents" on public.documents for all using (true) with check (true);
drop policy if exists "Allow all access for maintenance" on public.maintenance;
create policy "Allow all access for maintenance" on public.maintenance for all using (true) with check (true);
drop policy if exists "Allow all access for work_targets" on public.work_targets;
create policy "Allow all access for work_targets" on public.work_targets for all using (true) with check (true);
drop policy if exists "Allow all access for activity_logs" on public.activity_logs;
create policy "Allow all access for activity_logs" on public.activity_logs for all using (true) with check (true);

-- Query and integrity indexes. All are additive and safe to re-run.
create index if not exists survey_technicians_technician_id_idx
  on public.survey_technicians (technician_id);
create index if not exists surveys_date_status_idx
  on public.surveys (survey_date, status);
create index if not exists schedules_date_status_idx
  on public.schedules (date, status);
create index if not exists schedules_technician_id_idx
  on public.schedules (technician_id);
create index if not exists installations_start_date_status_idx
  on public.installations (start_date, status);
create index if not exists installation_items_installation_date_idx
  on public.installation_items (installation_id, work_date);
create index if not exists work_targets_status_period_idx
  on public.work_targets (status, period_start, period_end);
create index if not exists work_targets_technician_id_idx
  on public.work_targets (technician_id);
create index if not exists equipment_units_equipment_status_idx
  on public.equipment_units (equipment_id, status);
create index if not exists equipment_loans_equipment_id_idx
  on public.equipment_loans (equipment_id);
create index if not exists equipment_loans_status_borrowed_at_idx
  on public.equipment_loans (status, borrowed_at);
create index if not exists maintenance_equipment_status_idx
  on public.maintenance (equipment_id, status);
create index if not exists notifications_read_created_at_idx
  on public.notifications (read, created_at);
create index if not exists activity_logs_entity_timestamp_idx
  on public.activity_logs (entity_type, entity_id, created_at);
