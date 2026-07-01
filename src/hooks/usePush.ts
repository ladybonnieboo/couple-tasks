import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr.buffer
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const subJson = sub.toJSON()
  const { error } = await supabase
    .from('profiles')
    .update({ push_subscription: subJson })
    .eq('id', userId)

  return !error
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  await supabase.from('profiles').update({ push_subscription: null }).eq('id', userId)
}

export async function sendNudge(params: {
  toUserId: string
  title: string
  body: string
  taskId?: string
  eventId?: string
}): Promise<void> {
  const { error } = await supabase.functions.invoke('send-push', {
    body: {
      to_user_id: params.toUserId,
      title: params.title,
      body: params.body,
      task_id: params.taskId,
      event_id: params.eventId,
    },
  })
  if (error) throw error
}
