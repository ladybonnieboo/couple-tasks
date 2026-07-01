// Supabase Edge Function: send-push
// Sends a Web Push notification to a user via VAPID
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to_user_id, title, body, task_id, event_id } = await req.json()

    if (!to_user_id || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch recipient's push subscription
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', to_user_id)
      .single()

    if (profileErr || !profile?.push_subscription) {
      return new Response(JSON.stringify({ error: 'No push subscription for user' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Configure VAPID
    webpush.setVapidDetails(
      'mailto:' + (Deno.env.get('VAPID_EMAIL') ?? 'admin@familyplanner.app'),
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!
    )

    // Send push notification
    const payload = JSON.stringify({
      title,
      body,
      task_id,
      event_id,
    })

    await webpush.sendNotification(profile.push_subscription as webpush.PushSubscription, payload)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-push error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
