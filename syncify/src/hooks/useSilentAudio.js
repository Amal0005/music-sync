import { useEffect, useRef } from 'react';

// 1-second silent MP3 as a data URI — keeps the browser's audio context
// alive so it won't suspend background tabs / minimized windows.
// This is the same technique used by PWA music players.
const SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export function useSilentAudio(active) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const audio = new Audio(SILENT_MP3);
    audio.loop = true;
    audio.volume = 0;    // completely silent
    audioRef.current = audio;

    // Start on first user interaction (required by autoplay policy)
    function start() {
      audio.play().catch(() => {});
      document.removeEventListener('click', start);
      document.removeEventListener('keydown', start);
      document.removeEventListener('touchstart', start);
    }

    document.addEventListener('click', start);
    document.addEventListener('keydown', start);
    document.addEventListener('touchstart', start);

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', start);
      document.removeEventListener('keydown', start);
      document.removeEventListener('touchstart', start);
    };
  }, [active]);

  return audioRef;
}
