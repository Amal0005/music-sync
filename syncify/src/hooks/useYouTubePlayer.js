import { useEffect, useRef, useState, useCallback } from 'react';

let apiReady = false;
let apiCallbacks = [];

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    apiReady = true;
    return;
  }
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
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player) return;
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerRef.current = new window.YT.Player(containerId, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          setPlayerReady(true);
          onReady && onReady(e);
        },
        onStateChange: (e) => {
          onStateChange && onStateChange(e);
        },
      },
    });
  }, [containerId, onStateChange, onReady]);

  useEffect(() => {
    loadYouTubeAPI();

    if (apiReady) {
      initPlayer();
    } else {
      apiCallbacks.push(initPlayer);
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
      apiCallbacks = apiCallbacks.filter(cb => cb !== initPlayer);
    };
  }, [initPlayer]);

  const loadVideo = useCallback((videoId, autoplay = true) => {
    if (!playerRef.current || !playerReady) return;
    if (autoplay) {
      playerRef.current.loadVideoById(videoId);
    } else {
      playerRef.current.cueVideoById(videoId);
    }
  }, [playerReady]);

  const play = useCallback(() => {
    if (playerRef.current && playerReady) playerRef.current.playVideo();
  }, [playerReady]);

  const pause = useCallback(() => {
    if (playerRef.current && playerReady) playerRef.current.pauseVideo();
  }, [playerReady]);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current && playerReady) playerRef.current.seekTo(seconds, true);
  }, [playerReady]);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current && playerReady) return playerRef.current.getCurrentTime() || 0;
    return 0;
  }, [playerReady]);

  const getDuration = useCallback(() => {
    if (playerRef.current && playerReady) return playerRef.current.getDuration() || 0;
    return 0;
  }, [playerReady]);

  const getPlayerState = useCallback(() => {
    if (playerRef.current && playerReady) return playerRef.current.getPlayerState();
    return -1;
  }, [playerReady]);

  return { playerRef, playerReady, loadVideo, play, pause, seekTo, getCurrentTime, getDuration, getPlayerState };
}
