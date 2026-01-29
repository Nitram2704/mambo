-- Create Wagers Table (already exists in store, but let's ensure it matches our needs)
-- The store uses: id, group_id, title, stake, type, goal, status, winner_id, end_date, created_at
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='wagers') THEN
        CREATE TABLE public.wagers (
            id uuid default gen_random_uuid() primary key,
            group_id uuid references public.squads(id) on delete cascade,
            title text not null,
            stake text not null,
            type text check (type in ('consistency', 'weight', 'volume')) not null,
            goal numeric not null,
            status text check (status in ('active', 'completed', 'cancelled')) not null default 'active',
            winner_id uuid references auth.users(id),
            end_date timestamp with time zone not null,
            created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
    END IF;
END $$;

-- Create Challenges Table (Global/Squad challenges)
create table public.challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text check (type in ('global', 'squad')) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  reward_xp integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.wagers enable row level security;
alter table public.challenges enable row level security;

-- Policies
create policy "Wagers are viewable by squad members" on public.wagers for select using (true); -- Simplified
create policy "Challenges are viewable by everyone" on public.challenges for select using (true);

-- Realtime
alter publication supabase_realtime add table public.wagers;
alter publication supabase_realtime add table public.challenges;
