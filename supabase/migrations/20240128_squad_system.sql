-- Create Squads Table
create table public.squads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  banner_url text,
  privacy text check (privacy in ('public', 'private')) not null default 'public',
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Squad Members Table
create table public.squad_members (
  id uuid default gen_random_uuid() primary key,
  squad_id uuid references public.squads(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(squad_id, user_id)
);

-- Enable RLS
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;

-- Policies
create policy "Public squads are viewable by everyone" on public.squads for select using (true);
create policy "Users can create squads" on public.squads for insert with check (auth.uid() = owner_id);
create policy "Owners can update their squads" on public.squads for update using (auth.uid() = owner_id);

create policy "Squad members are viewable by everyone" on public.squad_members for select using (true);
create policy "Users can join public squads" on public.squad_members for insert with check (
  exists (
    select 1 from public.squads 
    where id = squad_id and privacy = 'public'
  ) or auth.uid() = user_id -- Simplified for now, would need invite logic for private
);

-- Realtime
alter publication supabase_realtime add table public.squads;
alter publication supabase_realtime add table public.squad_members;
