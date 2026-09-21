-- شغّل هذا الملف في Supabase SQL editor

-- قائمة الأزواج اللي يتابعها المستخدم
create table if not exists watchlist (
  id bigint generated always as identity primary key,
  symbol text not null unique,
  created_at timestamptz default now()
);

-- سجل الأسعار عبر الزمن
create table if not exists price_history (
  id bigint generated always as identity primary key,
  symbol text not null,
  price numeric not null,
  recorded_at timestamptz default now()
);

create index if not exists idx_price_history_symbol_time
  on price_history (symbol, recorded_at desc);

insert into watchlist (symbol) values
  ('EUR/USD'), ('GBP/USD'), ('USD/JPY'), ('USD/CHF')
on conflict (symbol) do nothing;
