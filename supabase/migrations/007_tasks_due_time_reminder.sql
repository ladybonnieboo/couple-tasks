-- Replace reminder_at with due_time + reminder_minutes on tasks
alter table public.tasks
  drop column if exists reminder_at,
  add column if not exists due_time time,
  add column if not exists reminder_minutes integer;
