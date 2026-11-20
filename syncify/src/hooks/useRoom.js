import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, set, get, onValue, push, serverTimestamp, onDisconnect, remove } from 'firebase/database';
import { db } from '../firebase';

export function useRoom(roomCode, userId, username) {
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [messages, setMessages] = useState([]);
  const [playbackState, setPlaybackState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const presenceRef = useRef(null);

  // ── Join room (write presence) ───────────────────────────────
  useEffect(() => {
    if (!roomCode || !userId || !username) return;

    const pRef = ref(db, `rooms/${roomCode}/participants/${userId}`);
    presenceRef.current = pRef;

    set(pRef, {
      username,
      joinedAt: serverTimestamp(),
      online: true,
    });

    // Remove on disconnect
    onDisconnect(pRef).remove();

    return () => {
      remove(pRef);
    };
  }, [roomCode, userId, username]);

  // ── Room metadata listener ───────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const rRef = ref(db, `rooms/${roomCode}/meta`);
    const unsub = onValue(rRef, (snap) => {
      if (!snap.exists()) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      setRoomData(snap.val());
      setLoading(false);
    });
    return unsub;
  }, [roomCode]);

  // ── Participants listener ────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const pRef = ref(db, `rooms/${roomCode}/participants`);
    const unsub = onValue(pRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setParticipants(list);
    });
    return unsub;
  }, [roomCode]);

  // ── Playlist listener ────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const plRef = ref(db, `rooms/${roomCode}/playlist`);
    const unsub = onValue(plRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
      setPlaylist(list);
    });
    return unsub;
  }, [roomCode]);

  // ── Playback state listener ──────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const pbRef = ref(db, `rooms/${roomCode}/playback`);
    const unsub = onValue(pbRef, (snap) => {
      setPlaybackState(snap.val());
    });
    return unsub;
  }, [roomCode]);

  // ── Chat listener ────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    const unsub = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(list);
    });
    return unsub;
  }, [roomCode]);

  // ── Actions ──────────────────────────────────────────────────
  const addToPlaylist = useCallback((song) => {
    const plRef = ref(db, `rooms/${roomCode}/playlist`);
    push(plRef, {
      ...song,
      addedBy: username,
      addedAt: Date.now(),
    });
  }, [roomCode, username]);

  const removeFromPlaylist = useCallback((songId) => {
    const sRef = ref(db, `rooms/${roomCode}/playlist/${songId}`);
    remove(sRef);
  }, [roomCode]);

  const updatePlayback = useCallback((state) => {
    const pbRef = ref(db, `rooms/${roomCode}/playback`);
    set(pbRef, {
      ...state,
      updatedAt: Date.now(),
    });
  }, [roomCode]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    push(chatRef, {
      userId,
      username,
      text: text.trim(),
      timestamp: Date.now(),
    });
  }, [roomCode, userId, username]);

  return {
    roomData,
    participants,
    playlist,
    messages,
    playbackState,
    loading,
    error,
    addToPlaylist,
    removeFromPlaylist,
    updatePlayback,
    sendMessage,
  };
}

// ── Create a new room ────────────────────────────────────────
export async function createRoom(roomCode, ownerUserId, ownerUsername, roomName) {
  const roomRef = ref(db, `rooms/${roomCode}/meta`);
  await set(roomRef, {
    roomCode,
    roomName,
    ownerUserId,
    ownerUsername,
    createdAt: Date.now(),
  });
}

// ── Check room exists ────────────────────────────────────────
export async function checkRoomExists(roomCode) {
  const snap = await get(ref(db, `rooms/${roomCode}/meta`));
  return snap.exists();
}
