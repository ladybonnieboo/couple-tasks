-- Schedule the event reminders cron job.
--
-- BEFORE running this migration, complete these steps in the Supabase dashboard:
--   1. Database → Extensions → enable pg_cron
--   2. Database → Extensions → enable pg_net
--   3. SQL Editor → run:
--        alter database postgres set app.supabase_url  = 'https://<your-project-ref>.supabase.co';
--        alter database postgres set app.service_role_key = '<your-service-role-key>';
--
-- Then run this file in the SQL Editor.

select cron.schedule(
  'event-reminders',
  '* * * * *',
  $$select public.fire_event_reminders();$$
);
