-- SmartNest 0001: accounts, sessions, password reset.
-- Role is a plain column that no API endpoint can write; the first admin is created
-- on boot from BOOTSTRAP_ADMIN_* env vars, or promoted manually with SQL.

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text not null,
  password_hash text not null,
  role          text not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_login_at timestamptz,
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_email_format    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint users_name_length     check (char_length(name) between 1 and 100),
  constraint users_role_valid      check (role in ('customer', 'admin'))
);
create unique index users_email_key on users (email);
create trigger users_touch_updated_at before update on users
  for each row execute function touch_updated_at();

-- Opaque bearer sessions. Only the SHA-256 of the token is stored, so a database leak
-- does not leak usable sessions. Logout deletes the row (server-side revocation).
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users (id) on delete cascade,
  token_hash   text not null unique,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at   timestamptz not null
);
create index sessions_user_id_idx on sessions (user_id);
create index sessions_expires_at_idx on sessions (expires_at);

create table password_reset_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at    timestamptz
);
create index password_reset_tokens_user_id_idx on password_reset_tokens (user_id);
