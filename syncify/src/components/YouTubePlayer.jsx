import { useEffect, useRef, useCallback, useState } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { formatTime } from '../utils/roomUtils';

const YT_STATES = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

export default function YouTubePlayer({
  currentSong, playbackState, isOwner, onPlaybackChange, onEnded,
}) {
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const progressInterval  = useRef(null);
  const lastSyncRef       = useRef(0);
  const isPlayingRef      = useRef(false); // tracks intended playing state
  const resumingRef       = useRef(false); // true while we're mid-restore
  const playStartRef      = useRef(null);  // { time, at } — wall clock when play started
  const playerContainerId = 'yt-player-container';

  // ── Keep a ref to latest playbackState so visibility handler can read it ──
  const playbackStateRef = useRef(playbackState);
  useEffect(() => { playbackStateRef.current = playbackState; }, [playbackState]);
  const currentSongRef = useRef(currentSong);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // ── Calculate the exact position the song should be at right now ──
  function calcCurrentPosition(pb) {
    if (!pb || !pb.isPlaying) return pb?.currentTime || 0;
    const elapsed = (Date.now() - (pb.playStartedAt || pb.updatedAt || Date.now())) / 1000;
    return (pb.currentTime || 0) + elapsed;
  }

  const handleStateChange = useCallback((e) => {
    // Track real intended state
    if (e.data === YT_STATES.PLAYING) isPlayingRef.current = true;
    if (e.data === YT_STATES.PAUSED)  isPlayingRef.current = false;
    if (e.data === YT_STATES.ENDED)   isPlayingRef.current = false;

    if (!isOwner) return;

    if (e.data === YT_STATES.PLAYING) {
      const t = e.target.getCurrentTime();
      playStartRef.current = { time: t, at: Date.now() };
      onPlaybackChange({
        isPlaying: true,
        currentTime: t,
        videoId: currentSongRef.current?.videoId,
        playStartedAt: Date.now(),
      });
    } else if (e.data === YT_STATES.PAUSED) {
      // Ignore forced pauses from tab-hide or our own resume seeks
      if (document.visibilityState === 'hidden') return;
      if (resumingRef.current) return;
      onPlaybackChange({
        isPlaying: false,
        currentTime: e.target.getCurrentTime(),
        videoId: currentSongRef.current?.videoId,
        playStartedAt: null,
      });
    } else if (e.data === YT_STATES.ENDED) {
      onPlaybackChange({ isPlaying: false, currentTime: 0, videoId: currentSongRef.current?.videoId, playStartedAt: null });
      onEnded && onEnded();
    }
  }, [isOwner, onPlaybackChange, onEnded]);

  const { playerReady, loadVideo, play, pause, seekTo, getCurrentTime, getDuration, getPlayerState } =
    useYouTubePlayer({ containerId: playerContainerId, onStateChange: handleStateChange });

  // ── Load + autoplay when owner selects a song ───────────────
  useEffect(() => {
    if (!playerReady || !currentSong?.videoId) return;
    loadVideo(currentSong.videoId, true);
  }, [currentSong?.videoId, playerReady]); // eslint-disable-line

  // ── Non-owner: sync from Firebase ────────────────────────────
  useEffect(() => {
    if (!playerReady || !playbackState || isOwner) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 1000) return;
    lastSyncRef.current = now;

    const targetTime = calcCurrentPosition(playbackState);
    const drift = Math.abs(targetTime - getCurrentTime());

    if (playbackState.isPlaying) {
      if (drift > 2) seekTo(targetTime);
      if (getPlayerState() !== YT_STATES.PLAYING) play();
    } else {
      if (drift > 0.5) seekTo(playbackState.currentTime);
      if (getPlayerState() === YT_STATES.PLAYING) pause();
    }
  }, [playbackState, playerReady, isOwner, play, pause, seekTo, getCurrentTime, getPlayerState]);

  // ── Non-owner: load video when owner changes song ────────────
  useEffect(() => {
    if (!playerReady || !playbackState?.videoId || isOwner) return;
    if (currentSong?.videoId !== playbackState.videoId) {
      loadVideo(playbackState.videoId, playbackState.isPlaying);
    }
  }, [playbackState?.videoId, playerReady, isOwner, currentSong?.videoId, loadVideo]);

  // ── Page Visibility: instant resume on tab restore ───────────
  useEffect(() => {
    if (!playerReady) return;

    function onHide() {
      // Nothing to do — we just let the browser pause it
    }

    function onShow() {
      const pb = playbackStateRef.current;

      // If the room is paused, nothing to restore
      if (!pb?.isPlaying && !isPlayingRef.current) return;

      resumingRef.current = true;

      // Calculate where we should be right now
      const targetTime = isOwner
        ? getCurrentTime() + 0   // owner: we'll seek forward below
        : calcCurrentPosition(pb);

      // For the owner, calculate elapsed hidden time differently:
      // We don't know exactly when hidden, so read current player position
      // and just resume from there (browser paused at the right time)
      const resumeTime = isOwner
        ? getCurrentTime()   // resume from where browser paused
        : targetTime;

      // Small delay so browser finishes waking up the iframe
      setTimeout(() => {
        seekTo(resumeTime);
        play();

        if (isOwner) {
          onPlaybackChange({
            isPlaying: true,
            currentTime: resumeTime,
            videoId: currentSongRef.current?.videoId,
            playStartedAt: Date.now() - resumeTime * 1000,
          });
        }

        // Lift the resume guard after a moment
        setTimeout(() => { resumingRef.current = false; }, 600);
      }, 250);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        onHide();
      } else {
        onShow();
      }
    }

    // Also handle window focus (covers minimise on desktop)
    function handleFocus() {
      if (document.visibilityState === 'visible') onShow();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [playerReady, isOwner, play, seekTo, getCurrentTime, onPlaybackChange]);

  // ── Progress tick ─────────────────────────────────────────────
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      if (!playerReady) return;
      setLocalProgress(getCurrentTime());
      setLocalDuration(getDuration());
    }, 500);
    return () => clearInterval(progressInterval.current);
  }, [playerReady, getCurrentTime, getDuration]);

  function handlePlayPause() {
    if (!isOwner) return;
    getPlayerState() === YT_STATES.PLAYING ? pause() : play();
  }

  function handleSeek(e) {
    if (!isOwner) return;
    const newTime = (parseFloat(e.target.value) / 100) * localDuration;
    seekTo(newTime);
    onPlaybackChange({
      isPlaying: getPlayerState() === YT_STATES.PLAYING,
      currentTime: newTime,
      videoId: currentSong?.videoId,
      playStartedAt: getPlayerState() === YT_STATES.PLAYING ? Date.now() - newTime * 1000 : null,
    });
  }

  const isPlaying   = getPlayerState() === YT_STATES.PLAYING;
  const progressPct = localDuration > 0 ? (localProgress / localDuration) * 100 : 0;

  return (
    <div className="bg-[#111] border-t border-white/5 shrink-0">
      {/* YT iframe — off-screen but in layout so API initialises */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', pointerEvents: 'none', opacity: 0 }}>
        <div id={playerContainerId} style={{ width: '1px', height: '1px' }} />
      </div>

      <div className="px-3 sm:px-4 pt-2 pb-3 flex flex-col gap-2">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 w-8 text-right tabular-nums">{formatTime(localProgress)}</span>
          <input
            type="range" min={0} max={100} step={0.1} value={progressPct}
            onChange={handleSeek} disabled={!isOwner}
            className={`flex-1 h-1 rounded-full appearance-none ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ background: `linear-gradient(to right, #9333ea ${progressPct}%, rgba(255,255,255,0.1) ${progressPct}%)` }}
          />
          <span className="text-xs text-white/30 w-8 tabular-nums">{formatTime(localDuration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentSong ? (
              <>
                <img src={currentSong.thumbnail} alt={currentSong.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-medium truncate leading-tight">{currentSong.title}</p>
                  <p className="text-xs text-white/40 truncate">{currentSong.channelTitle}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/30">No song</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => onEnded && onEnded('prev')} disabled={!isOwner}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors p-1">
              <SkipBack size={20} />
            </button>
            <button onClick={handlePlayPause} disabled={!isOwner || !currentSong}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => onEnded && onEnded('next')} disabled={!isOwner}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors p-1">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex-1 justify-end hidden sm:flex">
            {!isOwner && <span className="text-xs text-white/20 italic">Owner controls playback</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
