create table if not exists partner_interests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  location text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
