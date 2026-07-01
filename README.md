# Family Planner 💑

A shared family planner PWA for Sharon and Nikita — combining task management with a full shared calendar.

## Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (auth, database, realtime, edge functions)
- **Animations**: Framer Motion
- **Deployment**: Vercel

---

## Quick Start (Local Development)

### 1. Clone & Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL editor, run:
   - `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### 4. Generate VAPID Keys (for push notifications)

```bash
npx web-push generate-vapid-keys
```

Store both keys. `VAPID_PUBLIC_KEY` goes in `.env.local`. The private key goes in Supabase Secrets.

### 5. Run

```bash
npm run dev
```

---

## Supabase Edge Function Setup

### Deploy the send-push function

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets (never commit these)
supabase secrets set VAPID_PUBLIC_KEY=your-vapid-public-key
supabase secrets set VAPID_PRIVATE_KEY=your-vapid-private-key
supabase secrets set VAPID_EMAIL=your-email@example.com

# Deploy
supabase functions deploy send-push
```

### Enable pg_cron for event reminders

1. Go to Supabase Dashboard → Database → Extensions
2. Enable **pg_cron** and **pg_net**
3. Run `supabase/migrations/002_reminders_cron.sql` (uncomment the cron.schedule line)
4. Set app config:
   ```sql
   ALTER ROLE authenticator SET app.supabase_url = 'https://your-project.supabase.co';
   ALTER ROLE authenticator SET app.service_role_key = 'your-service-role-key';
   ```

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Family Planner app"
git remote add origin https://github.com/yourname/couple-tasks.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

### 3. Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
| `VITE_VAPID_PUBLIC_KEY` | `your-vapid-public-key` |

### 4. Deploy

Click **Deploy**. Vercel auto-deploys on every push to main.

### 5. Add as PWA to iPhone Home Screen

1. Open the Vercel URL in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Scroll down → **Add to Home Screen**
4. Both Sharon and Nikita do this — the app will behave like a native app

---

## App Structure

```
src/
├── components/
│   ├── auth/          AuthScreen (login/signup)
│   ├── calendar/      CalendarTab, MonthlyView, WeeklyView
│   ├── comments/      Comments thread
│   ├── events/        EventDetail, EventForm
│   ├── home/          HomeTab with daily summary
│   ├── navigation/    BottomNav (4 tabs)
│   ├── profile/       ProfileTab with push settings
│   ├── shared/        BottomSheet, FAB, PriorityBadge
│   └── tasks/         TasksTab, TaskCard, TaskDetail, TaskForm
├── hooks/             useTasks, useEvents, useComments, usePush
├── lib/               supabase.ts, dates.ts
├── stores/            authStore (Zustand)
└── types/             TypeScript interfaces
```

---

## Features

- 🏠 **Home tab** — daily summary, my tasks, partner tasks
- 📅 **Calendar** — monthly grid + weekly time view, recurring events
- ✅ **Tasks** — create, assign, prioritize, swipe to complete
- 💬 **Comments** — real-time chat on any task or event
- 🔔 **Push notifications** — nudge partner, event reminders
- 🌐 **Realtime sync** — changes appear instantly on both devices
- 📱 **PWA** — installable, works offline (cached assets)
- 🇮🇱 **Full Hebrew RTL** UI

---

## Two-User Signup Flow

1. Sharon opens the app → **הרשמה** → email + password + display name "Sharon"
2. Nikita opens the app → **הרשמה** → email + password + display name "Nikita"
3. Both will see each other's tasks and events automatically
