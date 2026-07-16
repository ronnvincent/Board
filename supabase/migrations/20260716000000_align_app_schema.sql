-- Align the database with the tables and columns used by the BoardingHow UI.
-- This migration is intentionally idempotent so it can be applied to an
-- existing Supabase project without dropping user data.

create extension if not exists pgcrypto;

alter table if exists public.profiles
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists emergency_name text,
  add column if not exists emergency_relation text,
  add column if not exists emergency_phone text,
  add column if not exists pref_rent boolean default true,
  add column if not exists pref_maintenance boolean default true,
  add column if not exists pref_announcements boolean default true,
  add column if not exists pref_visitors boolean default true,
  add column if not exists pref_push boolean default false;

alter table if exists public.rooms
  add column if not exists max_occupants integer default 1;

alter table if exists public.notices
  add column if not exists priority text default 'normal',
  add column if not exists is_urgent boolean default false;

alter table if exists public.maintenance_requests
  add column if not exists priority text default 'normal';

alter table if exists public.visitors
  add column if not exists qr_code text;

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  platform_name text not null default 'BoardingHow',
  support_email text not null default 'support@boardinghow.com',
  allow_registration boolean not null default true,
  maintenance_mode boolean not null default false,
  dark_mode_default boolean not null default false,
  theme_color text not null default '#1f5149',
  curfew_enabled boolean not null default false,
  curfew_start text not null default '22:00',
  curfew_end text not null default '05:00',
  allow_visitors boolean not null default true,
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text not null default '22:00',
  quiet_hours_end text not null default '07:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

insert into public.system_settings (platform_name)
select 'BoardingHow'
where not exists (select 1 from public.system_settings);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  receiver_id uuid not null,
  content text not null,
  is_read boolean not null default false,
  related_maintenance_request_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

create table if not exists public.rent_bills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  amount numeric not null default 0,
  due_date date,
  billing_period text,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists rent_bills_tenant_id_idx on public.rent_bills(tenant_id);
create index if not exists rent_bills_due_date_idx on public.rent_bills(due_date);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  rent_bill_id uuid,
  amount numeric not null default 0,
  description text,
  payment_method text,
  receipt_number text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_tenant_id_idx on public.payments(tenant_id);
create index if not exists payments_rent_bill_id_idx on public.payments(rent_bill_id);
create index if not exists payments_created_at_idx on public.payments(created_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  title text not null,
  body text not null,
  category text,
  priority text not null default 'normal',
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_id_idx on public.notifications(profile_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at);

create table if not exists public.maintenance_updates (
  id uuid primary key default gen_random_uuid(),
  maintenance_request_id uuid not null,
  author_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists maintenance_updates_request_id_idx on public.maintenance_updates(maintenance_request_id);
create index if not exists maintenance_updates_created_at_idx on public.maintenance_updates(created_at);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists push_subscriptions_endpoint_idx on public.push_subscriptions(endpoint);
create index if not exists push_subscriptions_profile_id_idx on public.push_subscriptions(profile_id);
