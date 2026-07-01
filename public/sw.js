const CACHE_NAME = 'family-planner-v1'
const STATIC_ASSETS = ['/', '/index.html']

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and Supabase API calls
  if (event.request.method !== 'GET' || url.hostname.includes('supabase')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type !== 'opaque') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/')))
  )
})

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Family Planner', body: event.data.text() }
  }

  const options = {
    body: data.body ?? '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      task_id: data.task_id,
      event_id: data.event_id,
      url: data.task_id
        ? `/tasks/${data.task_id}`
        : data.event_id
        ? `/events/${data.event_id}`
        : '/',
    },
    actions: [
      { action: 'open', title: 'פתח' },
      { action: 'close', title: 'סגור' },
    ],
    tag: data.task_id ?? data.event_id ?? 'general',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(data.title ?? 'Family Planner', options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url ?? '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl)
    })
  )
})
