# Syncify 🎵

Real-time collaborative music listening powered by YouTube + Firebase.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create a project**
2. Enable **Realtime Database** (choose a region, start in **test mode** for now)
3. Enable **Anonymous Authentication**: Authentication → Sign-in method → Anonymous → Enable
4. Go to **Project Settings → Your apps → Add app (Web)** → copy the config
5. Paste it into `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "https://YOUR-PROJECT-default-rtdb.firebaseio.com",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

### 3. Apply Firebase Security Rules

In Firebase Console → Realtime Database → Rules, paste the contents of `firebase.rules.json`.

### 4. Get a YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **YouTube Data API v3**
3. Create credentials → **API key**
4. (Optional) Restrict key to your domain
5. Paste it into `src/pages/RoomPage.jsx`:

```js
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
```

### 5. Run the app
```bash
npm run dev
```

---

## How It Works

| Feature | Implementation |
|---|---|
| Room creation | Writes room metadata to Firebase RTDB |
| Join via code/link | Reads room from RTDB, writes presence |
| Real-time sync | Firebase `onValue` listeners on playback node |
| YouTube playback | Official IFrame Player API |
| Song search | YouTube Data API v3 |
| Chat | Firebase RTDB push/listen |
| Presence | Firebase `onDisconnect().remove()` |

### Sync Logic

- The **room owner** drives playback. Play/pause/seek writes to `rooms/{code}/playback`.
- All other clients listen to `playback` and adjust their local player within ±2 seconds drift.
- Transmission delay is compensated by using `updatedAt` timestamp.

### Firebase Data Structure

```
rooms/
  {ROOM_CODE}/
    meta/        — roomName, ownerUserId, createdAt
    participants/
      {userId}/  — username, joinedAt, online
    playlist/
      {pushId}/  — videoId, title, thumbnail, channelTitle, addedBy
    playback/    — videoId, isPlaying, currentTime, updatedAt
    chat/
      {pushId}/  — userId, username, text, timestamp
```

---

## Testing Multi-Device Sync

1. Open the app in **two different browser windows** (or use another device)
2. Create a room in Window 1 — copy the invite link
3. Open the invite link in Window 2 — enter a name
4. Owner searches and adds a song
5. Owner presses play — both windows should start playing simultaneously

---

## Project Structure

```
src/
  components/
    YouTubePlayer.jsx   — Player bar with controls + IFrame API
    SearchPanel.jsx     — YouTube search UI
    Playlist.jsx        — Queue display
    ParticipantsPanel.jsx — Live participant list
    ChatPanel.jsx       — Room chat
  hooks/
    useYouTubePlayer.js — IFrame API wrapper
    useRoom.js          — Firebase listeners + actions
  pages/
    HomePage.jsx        — Landing page
    CreateRoomPage.jsx  — Room creation flow
    JoinRoomPage.jsx    — Join by code
    RoomPage.jsx        — Main music room
  utils/
    roomUtils.js        — Helpers (room code, invite link, time format)
  firebase.js           — Firebase init
```
