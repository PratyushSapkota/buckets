do $$
begin
  create type transaction_type as enum ('credit', 'debit', 'transfer');
exception
  when duplicate_object then null;
end
$$;

create table if not exists buckets (
  id uuid primary key,
  user_id uuid not null,
  name text not null,
  type text not null,
  currency text not null,
  color text,
  closed_at timestamptz
);

create table if not exists accounts (
  id uuid primary key,
  user_id uuid not null,
  bucket_id uuid not null references buckets (id),
  name text not null,
  closed_at timestamptz
);

create table if not exists categories (
  id uuid primary key,
  user_id uuid not null,
  name text not null,
  color text
);

create table if not exists transactions (
  id uuid primary key,
  description text,
  amount bigint not null check (amount > 0),
  type transaction_type not null,
  category_id uuid references categories (id),
  account_id uuid not null references accounts (id),
  transfer_account_id uuid references accounts (id),
  occurred_at timestamptz,
  check (
    (type = 'transfer' and transfer_account_id is not null and transfer_account_id <> account_id)
    or
    (type in ('credit', 'debit') and transfer_account_id is null)
  )
);