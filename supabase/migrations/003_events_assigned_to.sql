-- Add assigned_to to events (null = both / everyone)
alter table public.events
  add column if not exists assigned_to uuid references public.profiles(id);

create index if not exists events_assigned_to_idx on public.events(assigned_to);
