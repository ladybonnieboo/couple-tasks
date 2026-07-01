-- ============================================================
-- Event Reminder pg_cron Job
-- Prerequisites (Supabase dashboard → Database → Extensions):
--   1. Enable pg_cron
--   2. Enable pg_net
-- Then insert real values into app_config before running this migration.
-- ============================================================

-- Config table: stores supabase_url and service_role_key
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);
alter table public.app_config enable row level security;

-- Function called by cron to fire reminders
create or replace function public.fire_event_reminders()
returns void language plpgsql security definer as $$
declare
  r            record;
  supabase_url text;
  service_key  text;
  req_headers  jsonb;
  req_body     jsonb;
begin
  select value into supabase_url from public.app_config where key = 'supabase_url';
  select value into service_key  from public.app_config where key = 'service_role_key';

  req_headers := json_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || service_key
  );

  -- Event reminders
  for r in
    select distinct e.id as event_id, null::uuid as task_id, e.title, u.id as to_user_id
    from public.events e
    join public.profiles u on (
      u.id = e.created_by
      or u.id = e.assigned_to
      or e.assigned_to is null
    )
    where e.reminder_minutes is not null
      and e.reminder_minutes > 0
      and date_trunc('minute', e.start_datetime - interval '1 minute' * e.reminder_minutes)
          = date_trunc('minute', now())
      and u.push_subscription is not null
  loop
    req_body := json_build_object(
      'to_user_id', r.to_user_id,
      'title', chr(1514) || chr(1494) || chr(1499) || chr(1493) || chr(1512) || chr(1514) || ': ' || r.title,
      'body', chr(1492) || chr(1488) || chr(1497) || chr(1512) || chr(1493) || chr(1506) || ' ' || chr(1502) || chr(1514) || chr(1495) || chr(1497) || chr(1500) || ' ' || chr(1489) || chr(1511) || chr(1512) || chr(1493) || chr(1489),
      'event_id', r.event_id
    );
    perform net.http_post(
      supabase_url || '/functions/v1/send-push',
      req_body,
      '{}'::jsonb,
      req_headers
    );
  end loop;

  -- Task reminders (fire at due_date+due_time minus reminder_minutes; default time 09:00)
  for r in
    select distinct t.id as task_id, null::uuid as event_id, t.title, u.id as to_user_id
    from public.tasks t
    join public.profiles u on (
      u.id = t.created_by
      or u.id = t.assigned_to
      or t.assigned_to is null
    )
    where t.reminder_minutes is not null
      and t.reminder_minutes > 0
      and t.due_date is not null
      and t.is_done = false
      and date_trunc('minute',
            (t.due_date + coalesce(t.due_time, time '09:00')) - interval '1 minute' * t.reminder_minutes
          ) = date_trunc('minute', now())
      and u.push_subscription is not null
  loop
    req_body := json_build_object(
      'to_user_id', r.to_user_id,
      'title', chr(1514) || chr(1494) || chr(1499) || chr(1493) || chr(1512) || chr(1514) || ': ' || r.title,
      'body', chr(1494) || chr(1499) || chr(1493) || chr(1512) || ' ' || chr(1500) || chr(1496) || chr(1497) || chr(1508) || chr(1493) || chr(1500) || ' ' || chr(1489) || chr(1502) || chr(1513) || chr(1497) || chr(1502) || chr(1492),
      'task_id', r.task_id
    );
    perform net.http_post(
      supabase_url || '/functions/v1/send-push',
      req_body,
      '{}'::jsonb,
      req_headers
    );
  end loop;
end;
$$;

-- Schedule: run every minute (requires pg_cron and pg_net extensions enabled)
select cron.schedule(
  'event-reminders',
  '* * * * *',
  $$select public.fire_event_reminders();$$
);
