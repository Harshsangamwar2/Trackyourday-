# Trackyourday

A daily habit/task checklist app with streaks, built with React + Tailwind + Vite.
Installable on your phone as a PWA (Add to Home Screen).

## Run locally

```
npm install
npm run dev
```

Open the printed localhost URL.

## Deploy for free (Vercel)

1. Create a new GitHub repo and push this folder to it.
2. Go to https://vercel.com → "Add New Project" → import the repo.
3. Framework preset: **Vite** (auto-detected). Leave build settings as default
   (`npm run build`, output `dist`).
4. Click Deploy. You'll get a URL like `trackyourday.vercel.app`.

## Deploy for free (Netlify) — alternative

1. Push the folder to a GitHub repo.
2. Go to https://app.netlify.com → "Add new site" → "Import an existing project".
3. Build command: `npm run build`, publish directory: `dist`.
4. Deploy.

## Install it on your phone

1. Open your deployed URL in Chrome (Android) or Safari (iOS).
2. Tap the browser menu → **Add to Home Screen**.
3. It now opens full-screen like a native app, with its own icon.

## Notes

- Data is stored in the browser's `localStorage` on that device only. It
  won't sync across devices — that would need a backend (e.g. Supabase or
  Firebase) if you want that later.
- The manifest in `vite.config.js` references `icon-192.png` and
  `icon-512.png` in `/public`. Add your own app icon PNGs there before
  deploying (any square image works, or ask Claude to generate one).
