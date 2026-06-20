# Calling Feature — Integration Notes

This adds real-time audio/video calling (ported from `NagarVaani_Web`'s
`AuthorityContacts.jsx`) into the dashboard, restyled with Tailwind to match
the rest of the app.

## What was added/changed

- `src/context/CallContext.tsx` — Socket.IO signaling + WebRTC peer
  connection, call state machine (idle → dialing/ringing → active), ring/dial
  tones (Web Audio API, no audio files needed).
- `src/components/CallOverlay.tsx` — global full-screen call UI (dialing,
  incoming-call prompt, active call window with mute/camera/notes).
- `src/views/VideoCall.tsx` — replaced the static mock with a real "Quick
  Dial" panel wired to `CallContext`.
- `src/views/Comm.tsx` — added audio/video call buttons to the active chat
  thread header, plus an on-call indicator in the directory roster.
- `src/App.tsx` — wraps the dashboard in `<CallProvider>` (identity = the
  user's role label, e.g. "Chief Minister", "New Delhi DM") and renders
  `<CallOverlay />` so an incoming call can interrupt any tab.
- `src/utils/helper.ts` — added `getRoleLabel()`, the same role-label logic
  already used by `Comm.tsx`/`Store.tsx`, now shared as the calling identity.
- `server/` — a small standalone Socket.IO signaling relay (ported from
  `NagarVaani_Web/server/server.js`'s `register`/`signal` events). It only
  relays signaling messages; no audio/video ever passes through it
  (WebRTC media is peer-to-peer).

## New dependency

Add to your existing client `package.json`:

```bash
npm install socket.io-client
```

## Running the signaling server

```bash
cd server
npm install
npm start   # listens on http://localhost:5001
```

The client defaults to `http://localhost:5001`. To point elsewhere, add to
your client `.env`:

```
VITE_SIGNALING_URL=http://your-server:5001
```

## Trying it out

Calling works between two separate logged-in sessions (e.g. two browser
windows/profiles), since each session registers under its role label
("Chief Minister", "New Delhi DM", etc.) — the same identity already used for
the existing internal messenger. Log in as two different roles, open
**Communications**, select the other party, and use the phone/video icons in
the thread header (or use the Quick Dial panel under **Video Conference
Room**).
