-- Run in Supabase SQL Editor (adds wallet fields to profiles)

alter table public.profiles
  add column if not exists credits integer not null default 0,
  add column if not exists balance_ngn numeric(14,2) not null default 0;

comment on column public.profiles.credits is 'Genny Studio credits';
comment on column public.profiles.balance_ngn is 'Withdrawable earnings in NGN';
