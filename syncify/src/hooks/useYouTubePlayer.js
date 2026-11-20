import { useEffect, useRef, useState, useCallback } from 'react';

let apiReady = false;
let apiCallbacks = [];

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) { apiReady = true; return; }
  if (document.getElementById('yt-iframe-api')) return;

  const tag = document.createElement('script');
  tag.id = 'yt-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    apiCallbacks.forEach(cb => cb());
    apiCallbacks = [];
  };
}

export function useYouTubePlayer({ containerId, onStateChange, onReady }) {
  const playerRef      = useRef(null);
  const readyRef       = useRef(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Latest callbacks in refs — no stale closures
  const onStateChangeRef = useRef(onStateChange);
  const onReadyRef       = useRef(onReady);
  useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
  useEffect(() => { onReadyRef.current       = onReady;       }, [onReady]);

  // ── Whether we intend the song to be playing right now ──────
  // Updated by the caller via play()/pause() so the visibility
  // handler always knows the intended state.
  const intendPlayingRef = useRef(false);

  const isReady = () =>
    readyRef.current &&
    playerRef.current &&
    typeof playerRef.current.playVideo === 'function';

  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player) return;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }
    readyRef.current = false;

    playerRef.current = new window.YT.Player(containerId, {
      height: '90',
      width: '160',
      playerVars: {
        autoplay:       1,
        controls:       0,
        disablekb:      1,
        fs:             0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel:            0,
        playsinline:    1,
        origin:         window.location.origin,
      },
      events: {
        onReady: (e) => {
          readyRef.current = true;
          setPlayerReady(true);
          onReadyRef.current && onReadyRef.current(e);
        },
        onStateChange: (e) => {
          onStateChangeRef.current && onStateChangeRef.current(e);
        },
        onError: (e) => {
          console.warn('YT player error:', e.data);
        },
      },
    });
  }, [containerId]);

  useEffect(() => {
    loadYouTubeAPI();
    if (apiReady) {
      initPlayer();
    } else {
      apiCallbacks.push(initPlayer);
    }
    return () => {
      apiCallbacks = apiCallbacks.filter(cb => cb !== initPlayer);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
      readyRef.current = false;
    };
  }, [initPlayer]);

  // ── Visibility / focus guard ─────────────────────────────────
  // This lives inside the hook so it fires synchronously with the
  // player reference — no React re-render delay.
  useEffect(() => {
    let resumeTimer = null;

    function attemptResume() {
      if (!intendPlayingRef.current) return;
      if (!isReady()) return;
      clearTimeout(resumeTimer);
      // Try immediately, then again after 300 ms in case the browser
      // is still waking up the iframe
      playerRef.current.playVideo();
      resumeTimer = setTimeout(() => {
        if (!intendPlayingRef.current) return;
        if (!isReady()) return;
        playerRef.current.playVideo();
      }, 300);
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') attemptResume();
    }

    function onFocus() {
      attemptResume();
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      clearTimeout(resumeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, []); // runs once — uses refs only, no stale closures

  // ── Public API ───────────────────────────────────────────────

  const loadVideo = useCallback((videoId, autoplay = true) => {
    if (!isReady()) return;
    intendPlayingRef.current = autoplay;
    if (autoplay) {
      playerRef.current.loadVideoById(videoId);
    } else {
      playerRef.current.cueVideoById(videoId);
    }
  }, []); // eslint-disable-line

  const play = useCallback(() => {
    intendPlayingRef.current = true;
    if (isReady()) playerRef.current.playVideo();
  }, []); // eslint-disable-line

  const pause = useCallback(() => {
    intendPlayingRef.current = false;
    if (isReady()) playerRef.current.pauseVideo();
  }, []); // eslint-disable-line

  const seekTo = useCallback((seconds) => {
    if (isReady()) playerRef.current.seekTo(seconds, true);
  }, []); // eslint-disable-line

  const getCurrentTime = useCallback(() => {
    if (!isReady()) return 0;
    try { return playerRef.current.getCurrentTime() || 0; } catch { return 0; }
  }, []); // eslint-disable-line

  const getDuration = useCallback(() => {
    if (!isReady()) return 0;
    try { return playerRef.current.getDuration() || 0; } catch { return 0; }
  }, []); // eslint-disable-line

  const getPlayerState = useCallback(() => {
    if (!isReady()) return -1;
    try { return playerRef.current.getPlayerState(); } catch { return -1; }
  }, []); // eslint-disable-line

  return {
    playerRef, playerReady,
    loadVideo, play, pause, seekTo,
    getCurrentTime, getDuration, getPlayerState,
  };
}
