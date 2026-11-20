/**
 * Generate a random 6-character uppercase room code
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Build a shareable invite URL for a given room code
 */
export function buildInviteLink(roomCode) {
  return `${window.location.origin}/join?code=${roomCode}`;
}

/**
 * Format seconds as mm:ss
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url) {
  const patterns = [
    /(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
