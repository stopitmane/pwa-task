# Task PWA

A React + Vite Progressive Web App for offline-first task management with IndexedDB, caching, and push notification support.

## Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Offline
- Tasks are stored in IndexedDB, available offline.
- Service worker caches HTML, JS/CSS, images, fonts.

## Push Notifications
- A minimal service worker shows notifications from push events.
- You need a server to send push messages using Web Push protocol.
- We will set up a Node server in `/server` that issues VAPID keys, stores subscriptions, and sends notifications.

## Next steps
- Start the server and wire client subscription flow.
- Replace icons with proper PNGs (192x192, 512x512).
